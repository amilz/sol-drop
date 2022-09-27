# sol drop
 
This will take a `gib-holders` export from cryptostraps, reformat the data, and airdrop SOL to the holders based on number of NFTs each holder holds. 

*If you are on mainnet, real funds will be transferred. Once you run the script, there will be no way to cancel the transactions. We are in no way responsible for your use or misuse of this. Use at your own risk.*

### Install

Clone repo
Install ts-node if you don't have it (`yarn add ts-node`)
Run `yarn install`

### Configuration 
Update input values for `config/config.json`: 
```json
{
    "SOL_PER_DROP": 0.001,
    "DROP_NAME": "Drop Name Identifier # XX",
    "RPC": "https://example.solana.quiknode.pro/abc/",
    "OUTPUT_DIR": "output",
    "NUM_DROP_PER_TX": 16,
    "TX_INTERVAL": 1000,
    "EXCLUDE_LIST": ["EXCLUDE_WALLET_1","EXCLUDE_WALLET_2"],
    "AMILZ_SOL_TIP": 0
}
```
- `SOL_PER_DROP` is the amount of SOL to be dropped per NFT held
- `DROP_NAME` is a name that will be used in the Solana transaction memo (viewable on Solana Explorer)
- `RPC` your RPC provider. If you don't have one, you can get one free at [quicknode.com](https://quicknode.com/)
    - If you are on mainnet, real funds will be transferred. Once you run the script, there will be no way to cancel the transactions. We are in no way responsible for your use or misuse of this. Use at your own risk. 
- `OUTPUT_DIR` name of directory to save tx summary (make sure the directory exists--if it doesn't exist, the file won't be saved)
- `NUM_DROP_PER_TX` the number of sol drops to include in a given transaction (don't mess with this unless you've done the math on tx size)
- `TX_INTERVAL` number of ms to wait between submitting transactions to the network (done to prevent rate limits)--not recommeded to go lower than `1000` as it limits could impact success of some transactions
- `EXCLUDE_LIST` list of wallets to exclude (replace the strings with your own)
- `AMILZ_SOL_TIP` amount in sol to tip amilz. default is 0 (that's totally cool!). 


### Wallet
Add your wallet's private key array to `config/privateKey.json`.

### Holder List
Use [Cryptostrap Tools](https://cryptostraps.tools/holder-snapshot) to get holder list and save file to `config/gib-holders.json`.
Holder list must be of type `GibExport`: 

```ts
//Format from Gib
export interface Holdings {
    mints: string[];
    amount: number;
}
export interface GibExport { 
    [wallet: string]: Holdings 
}
```

### Run Script 
In terminal run `npm run drop`. 
Terminal output should look like this: 
```sh
Initiating SOL drop from YOUR_WALLET_ADDRESS.
Sending XXX ◎ per NFT (XXX ◎ Total).
    Requesting Transaction 1/x
    #...
    Requesting Transaction x/x
AirDrop Complete!🎉 
Transaction Summary written to: output/airdrop-YYYY-MM-DD.json
```

Modfied from: [quicknode.com/guides/](https://www.quicknode.com/guides/web3-sdks/how-to-send-bulk-transactions-on-solana)