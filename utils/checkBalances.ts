import { clusterApiUrl, Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import _config from '../config/config.json';
import { Config, Drop, GibExport } from '../types/types';
import _holders from '../config/gib-holders.json';
import { cleanGibList } from './clean';
import * as fs from 'fs';
import { generateFileName } from './genFileName';

const CONFIG = _config as Config;
const SOLANA_CONNECTION = new Connection(clusterApiUrl('mainnet-beta'));
const holders = _holders as GibExport;
const dropList: Drop[] = cleanGibList(holders);

async function removeEmptyAccounts(drops: Drop[], dropAmount: number):Promise<Drop[]> {
    console.log('checking for acounts with low balance');
    const minimumBalanceForRentExemption = await SOLANA_CONNECTION.getMinimumBalanceForRentExemption(1).catch(err=>console.log(err));
    if (dropAmount > minimumBalanceForRentExemption) return drops;
    let i = 0;
    const removed:Drop[] = [];
    for (const drop in drops) {
        console.log(`${i} of ${drops.length}`)
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
            i++;
        }
    }
    const fileName = await generateFileName('removed',CONFIG.OUTPUT_DIR,'json');
    let data = JSON.stringify(removed);
    fs.writeFileSync(fileName, data);

    return drops;

}

removeEmptyAccounts(dropList,0.00001);