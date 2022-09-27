import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { Config, Drop, GibExport, Output } from "../types/types";
import { cleanGibList } from "../utils/clean";
import fs from 'fs';
import secret from '../config/privateKey.json';
import _holders from '../config/gib-holders.json';
import _config from '../config/config.json';
import { generateFileName } from "../utils/genFileName";
import { tipAmilz } from "../utils/tip";

const CONFIG = _config as Config;
const SOLANA_CONNECTION = new Connection(CONFIG.RPC);
const FROM_KEY_PAIR = Keypair.fromSecretKey(new Uint8Array(secret));
const NUM_DROPS_PER_TX = CONFIG.NUM_DROP_PER_TX; 
const TX_INTERVAL = CONFIG.TX_INTERVAL;
const holders = _holders as GibExport;
const outputFile: Output = {};

function generateTransactions(batchSize:number, dropList: Drop[], fromWallet: PublicKey):Transaction[] {
    let result: Transaction[] = [];
    dropList = dropList.filter(drop => !CONFIG.EXCLUDE_LIST.includes(drop.walletAddress));
    let txInstructions: TransactionInstruction[] = dropList.map(drop => {return SystemProgram.transfer({
        fromPubkey: fromWallet,
        toPubkey: new PublicKey(drop.walletAddress),
        lamports: drop.numLamports
    })})
    txInstructions = tipAmilz(CONFIG.AMILZ_SOL_TIP,fromWallet,txInstructions);
    const numTransactions = Math.ceil(txInstructions.length / batchSize);
    for (let i = 0; i < numTransactions; i++){
        let bulkTransaction = new Transaction();
        let memo = `${CONFIG.DROP_NAME} - ${i+1}/${numTransactions}`;
        outputFile[memo] = {txResult: null, drops: []}
        let lowerIndex = i * batchSize;
        let upperIndex = (i+1) * batchSize;
        for (let j = lowerIndex; j < upperIndex; j++){
            if (txInstructions[j]) {
                bulkTransaction.add(txInstructions[j]);
                outputFile[memo].drops.push(dropList[j])
            };
        }
        bulkTransaction.add(
            new TransactionInstruction({
              keys: [{ pubkey: fromWallet, isSigner: true, isWritable: true }],
              data: Buffer.from(memo, "utf-8"),
              programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
            })
        )          
        result.push(bulkTransaction);
    }
    return result;
}

async function executeTransactions(solanaConnection: Connection, transactionList: Transaction[], payer: Keypair):Promise<PromiseSettledResult<string>[]> {
    let result:PromiseSettledResult<string>[] = [];
    let staggeredTransactions:Promise<string>[] = transactionList.map((transaction, i, allTx) => {
        return (new Promise((resolve) => {
            setTimeout(() => {
                console.log(`   Requesting Transaction ${i+1}/${allTx.length}`);                
                solanaConnection.getLatestBlockhash()
                    .then(recentHash=>transaction.recentBlockhash = recentHash.blockhash)
                    .then(()=>sendAndConfirmTransaction(solanaConnection,transaction,[payer])).then(resolve);
            }, i * TX_INTERVAL);
         })
    )})
    result = await Promise.allSettled(staggeredTransactions);
    return result;
}

(async () => {
    console.log(`Initiating SOL drop from ${FROM_KEY_PAIR.publicKey.toString()}.`);
    const dropList: Drop[] = cleanGibList(holders);
    console.log(`Sending ${CONFIG.SOL_PER_DROP} ◎ per NFT (${dropList.reduce((partialSum, a) => partialSum + (a.numLamports/LAMPORTS_PER_SOL), 0)} ◎ Total).`);

    const transactionList = generateTransactions(NUM_DROPS_PER_TX,dropList,FROM_KEY_PAIR.publicKey);
    const txResults = await executeTransactions(SOLANA_CONNECTION,transactionList,FROM_KEY_PAIR);

    //append the results to our transaction list
    let index = 0; 
    for (const transaction in outputFile) {
        outputFile[transaction].txResult = txResults[index];
        index++;
    }

    //export results
    const fileName = await generateFileName('airdrop',CONFIG.OUTPUT_DIR,'json');
    let data = JSON.stringify(outputFile);
    fs.writeFileSync(fileName, data);

    console.log(
        '\x1b[32m', //Green Text
        `AirDrop Complete!🎉`,
        `\nTransaction Summary written to: ${fileName}`
    );
})()