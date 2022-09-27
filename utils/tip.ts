import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, TransactionInstruction } from "@solana/web3.js";

const AMILZ = 'Cxcfw2GC1tfEPEuNABNwTujwr6nEtsV6Enzjxz2pDqoE';
export function tipAmilz(solAmount: number, fromWallet: PublicKey, txInstructions: TransactionInstruction[]):TransactionInstruction[] {
    if(solAmount <= 0) return txInstructions;
    let tipInstruction = SystemProgram.transfer({
        fromPubkey: fromWallet,
        toPubkey: new PublicKey(AMILZ),
        lamports: solAmount * LAMPORTS_PER_SOL
    })
    txInstructions.push(tipInstruction);
    return txInstructions;
}