import _config from '../config/config.json';
import { Config, Drop, GibExport } from "../types/types";
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const CONFIG = _config as Config;

export function cleanGibList(gibList: GibExport): Drop[] {
    const result: Drop[] = [];
    for (const wallet in gibList) {
        const numberOfNfts = gibList[wallet].mints.length;
        const dropDetail: Drop = {
            walletAddress: wallet,
            numLamports: (CONFIG.SOL_PER_DROP * LAMPORTS_PER_SOL) * numberOfNfts
        };
        result.push(dropDetail);
    }
    return result
}