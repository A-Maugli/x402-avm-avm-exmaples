# x402-avm-examples

A collection of simple examples demonstrating the use of X402 protocol on Algorand, 
enabling micropayments for paid content.

## ⚠️ Important Note
All accounts and addresses shown in the `.env` files and throughout this documentation 
are **Algorand Testnet accounts**. These should never be used on Mainnet. 
Always use separate accounts for production environments.

## Prerequisites

Before running any components, you'll need to set up three Algorand Testnet accounts:

### Facilitator Account

This account pays transaction fees in Algos for all X402 operations.

1. Generate an Algorand account (see [Account Generation](#algorand-account-generation))
2. Add the private key to `facilitator/.env`
3. Fund with test Algos at [AlgoKit Testnet Faucet](https://lora.algokit.io/testnet/fund)

### Server Account

This account receives USDC payments for content.

1. Generate an Algorand account
2. Add the address to:
   - `server/.env`
   - `server-with-paywall/.env`
3. Fund with test Algos at [AlgoKit Testnet Faucet](https://lora.algokit.io/testnet/fund)
4. Opt into test USDC (Asset ID: 10458941) using the [Transaction Wizard](https://lora.algokit.io/mainnet/transaction-wizard)

### Client Account

This account sends USDC to access paid content.

1. Generate an Algorand account
2. Add the private key to `client-wo-wallet/.env`
3. Fund with test Algos at [AlgoKit Testnet Faucet](https://lora.algokit.io/testnet/fund)
4. Opt into test USDC (Asset ID: 10458941) using the [Transaction Wizard](https://lora.algokit.io/mainnet/transaction-wizard)
5. Obtain test USDC from the [Circle Faucet](https://faucet.circle.com/)

Alternatively, you can use the preconfigured values provided in the `.env` files. 
If the amounts are depleted, don't forget to refill them using the faucets above.

## Algorand Account Generation

Generate a new Algorand account with the following commands:

```bash
cd generate-algorand-account
npm install
node generate-algorand-account.ts
```

Example output:
```
$ node generate-algorand-account.ts
Address: GTKK6IHQTG6QO6SSHVDZEGC3JK4QDZXTBRO2TYHJEQDO766T534LEV6I4U
Mnemonic: drama fuel regular noodle ginger effort change antenna deliver doctor what trim text blouse series same praise smart fly face blush alien grape abstract diary
Private Key (Base64): EXqXaWEJsRrFxAnQEZDzi97vYID4vkwl87MYRQwZuOw01K8g8Jm9B3pSPUeSGFtKuQHm8wxdqeDpJAbv+9Pu+A==
```

## 1. Facilitator Service

The facilitator handles transaction fee payments and coordinates the payment flow.

```
cd facilitator
npm i
node facilitator-service.ts
```

Expected output:
```
$ node facilitator-service.ts
[dotenv@17.3.1] injecting env (1) from .env -- tip: � agentic secret storage: https://dotenvx.com/as2
Facilitator service running on port 4000
Fee payer address: 7XYMMF2V2FRPW3LFTK34L47OMY2IXCYULFNW4EBTH6N7ZOZFSVPLXMQABY
Networks: Testnet + Mainnet
```

## 2. Basic Server

A simple server that serves paid content without a paywall UI.

```
cd ../server
npm i
node index-express.ts
```

Expected output:
```
$ node index-express.ts
[dotenv@17.3.1] injecting env (2) from .env -- tip: � prevent committing .env to code: https://dotenvx.com/precommit
Server listening at http://localhost:4021
```

CTRL+Click on `http://localhost:4021` and try to get URL `http://localhost:4021/weather_paid`

## 3. Server with Paywall

A server that includes a paywall UI for paid content access.

```
cd ../server-with-paywall
npm i
node index-express.ts
```

Expected output:

```
$ node index-express.ts 
[dotenv@17.3.1] injecting env (2) from .env -- tip: � prevent building .env in docker: http 
s://dotenvx.com/prebuild
Server listening at http://localhost:4022
```

CTRL+Click on `http://localhost:4022` and try to get URL `http://localhost:4022/weather_paid`

## 4. Client Without Wallet

A client that demonstrates making payments without a browser wallet.

```
cd ../client_wo_wallet
npm i
node client.ts
```

Expected output:
```
$ node client.ts 
[dotenv@17.3.1] injecting env (1) from .env -- tip: ⚙️  load multiple .env files with { path
: ['.env.local', '.env'] }
[x402 AVM Client] Creating payment: {
  sender: 'OTVM4R655V7OPFBKF7PYJXL2A2AH5KUSXE2KI33TAD4IABYGM65I6Q257M',
  receiver: 'WRU6W45L5W4GUUHHLVXMEWJJHJY6RMHLZIDJYLDFG6OS7JFNQKW6GSPGUU',
  amount: '1000',
  assetId: '10458941',
  network: 'algorand:SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=',
  clientIndexes: [ 1 ],
  txnCount: 2,
  hasFeePayer: true
}
[x402 AVM Client] Signed transactions: { signedCount: 1, totalCount: 2, signedIndexes: [ 1 ] }
Data: { report: { weather: 'sunny', temperature: 70 } }
```

## References

[X402-AVM Specification](https://github.com/coinbase/x402/blob/main/specs/schemes/exact/scheme_exact_algo.md)

[X402-AVM Documentation](https://github.com/GoPlausible/.github/blob/main/profile/algorand-x402-documentation/README.md)

[X402 Protocol Live Instance for Algorand](https://x402.goplausible.xyz/)

[X402-AVM Repository](https://github.com/GoPlausible/x402-avm/tree/branch-algorand-v2)

## Troubleshooting
- Ensure all `.env` files are properly configured with the correct addresses and private keys
- Verify accounts have sufficient test Algos for transaction fees
- Confirm USDC opt-in was successful before attempting payments
- Check that all services are running on their default ports (4000, 4021, 4022)

