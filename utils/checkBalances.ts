import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import _config from '../config/config.json';
import { Config, Drop, GibExport } from '../types/types';
import _holders from '../config/gib-holders.json';
import * as fs from 'fs';
import { generateFileName } from './genFileName';
import { delay, printProgress } from './misc';

const CONFIG = _config as Config;
const SOLANA_CONNECTION = new Connection(CONFIG.RPC);
const holders = _holders as GibExport;

async function removeEmptyAccounts(drops: Drop[], dropAmount: number):Promise<Drop[]> {
    console.log('checking for acounts with low balance');
    const minimumBalanceForRentExemption = await SOLANA_CONNECTION.getMinimumBalanceForRentExemption(1).catch(err=>console.log(err));
    if (dropAmount > minimumBalanceForRentExemption) return drops;
    let i = 0;
    const removed:Drop[] = [];
    for (const drop in drops) {
        //if(((i+1) % 10) === 0) console.log(`   ${i+1} of ${drops.length}`);
        printProgress((i+1)/drops.length);
        try{
            const acctInfo = await SOLANA_CONNECTION.getAccountInfo(new PublicKey(drops[i].walletAddress));
            const balance = acctInfo?.lamports
            if (!balance || (balance <= minimumBalanceForRentExemption)) {
                removed.push(drops[i]);
                drops.splice(i,1);
            }
        } catch (err) {
            console.log(err);
            removed.push(drops[i]);
            drops.splice(i,1);
        } finally {
            await delay(CONFIG.TX_INTERVAL);
            i++;
        }
    }
    const fileName = await generateFileName('removed',CONFIG.OUTPUT_DIR,'json');
    let data = JSON.stringify(removed);
    fs.writeFileSync(fileName, data);

    return drops;

}

async function haveSufficientLamports(drops: Drop[], senderWallet: PublicKey): Promise <Boolean> {
    const senderInfo = await SOLANA_CONNECTION.getAccountInfo(senderWallet);
    const senderBalance = senderInfo?.lamports;
    const amountToSend = drops.reduce((partialSum, a) => partialSum + a.numLamports, 0);
    if (!senderBalance) {return false}
    else {return senderBalance > amountToSend}
}

export {removeEmptyAccounts, haveSufficientLamports};