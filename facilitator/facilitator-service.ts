// facilitator-service.ts
import express from "express";
import { x402Facilitator } from "@x402-avm/core/facilitator";
import { registerExactAvmScheme } from "@x402-avm/avm/exact/facilitator";
import { ALGORAND_TESTNET_CAIP2, ALGORAND_MAINNET_CAIP2 } from "@x402-avm/avm";
import algosdk from "algosdk";
import dotenv from "dotenv";

const debug = false;

dotenv.config();

// Build signer from environment
const secretKey = Buffer.from(process.env.AVM_PRIVATE_KEY!, "base64");
const address = algosdk.encodeAddress(secretKey.slice(32));

const algodTestnet = new algosdk.Algodv2("", "https://testnet-api.4160.nodely.dev", "443");
const algodMainnet = new algosdk.Algodv2("", "https://mainnet-api.4160.nodely.dev", "443");

function getClient(network: string) {
  return network === ALGORAND_MAINNET_CAIP2 ? algodMainnet : algodTestnet;
}

const signer = {
  getAddresses: () => [address] as const,
  signTransaction: async (txn: Uint8Array) => {
    const decoded = algosdk.decodeUnsignedTransaction(txn);
    return algosdk.signTransaction(decoded, secretKey).blob;
  },
  getAlgodClient: (network: string) => getClient(network),
  simulateTransactions: async (txns: Uint8Array[], network: string) => {
    const client = getClient(network);
    const stxns = txns.map((t) => {
      try { return algosdk.decodeSignedTransaction(t); }
      catch { return new algosdk.SignedTransaction({ txn: algosdk.decodeUnsignedTransaction(t) }); }
    });
    const req = new algosdk.modelsv2.SimulateRequest({
      txnGroups: [new algosdk.modelsv2.SimulateRequestTransactionGroup({ txns: stxns })],
      allowEmptySignatures: true,
    });
    const result = await client.simulateTransactions(req).do();
    for (const g of result.txnGroups || []) {
      if (g.failureMessage) throw new Error(`Simulation failed: ${g.failureMessage}`);
    }
    return result;
  },
  sendTransactions: async (signedTxns: Uint8Array[], network: string) => {
    const client = getClient(network);
    const combined = Buffer.concat(signedTxns.map((t) => Buffer.from(t)));
    const { txid } = await client.sendRawTransaction(combined).do();
    return txid;
  },
  waitForConfirmation: async (txId: string, network: string, rounds = 4) => {
    return algosdk.waitForConfirmation(getClient(network), txId, rounds);
  },
};

// Setup facilitator
const facilitator = new x402Facilitator();
registerExactAvmScheme(facilitator, {
  signer,
  networks: [ALGORAND_TESTNET_CAIP2, ALGORAND_MAINNET_CAIP2],
});

// Express app
const app = express();
app.use(express.json({ limit: "1mb" }));

app.get("/supported", async (_req, res) => {
  try {
    res.json(facilitator.getSupported()) //.getSupportedNetworks());
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/verify", async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body;
    if (debug) console.log("Payment Payload:", paymentPayload);
    if (debug) console.log("Payment Requirements:", paymentRequirements);
    const result = await facilitator.verify(paymentPayload, paymentRequirements);
    res.json(result);
    if (debug) console.log("Verification result:", result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

app.post("/settle", async (req, res) => {
  try {
    const { paymentPayload, paymentRequirements } = req.body;
    const result = await facilitator.settle(paymentPayload, paymentRequirements);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

const PORT = parseInt(process.env.PORT || "4000", 10);
app.listen(PORT, () => {
  console.log(`Facilitator service running on port ${PORT}`);
  console.log(`Fee payer address: ${address}`);
  console.log(`Networks: Testnet + Mainnet`);
});