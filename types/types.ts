// Format for our Drop
export interface Drop {
    walletAddress: string,
    numLamports: number
}

//Format from Gib
export interface Holdings {
    mints: string[];
    amount: number;
}
export interface GibExport { 
    [wallet: string]: Holdings 
}

//Config
export interface Config {
    SOL_PER_DROP: number, 
    DROP_NAME: string,
    RPC: string,
    OUTPUT_DIR: string,
    NUM_DROP_PER_TX: number,
    TX_INTERVAL: number,
    EXCLUDE_LIST: string[], 
    AMILZ_SOL_TIP: number
}

//OUTPUT FILE
export interface Output {
    [dropNumber: string]: {     
        txResult: PromiseSettledResult<string> | null,   
        drops: Drop[]        
    }        
}

