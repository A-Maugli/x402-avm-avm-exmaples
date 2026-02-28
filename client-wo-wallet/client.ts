import { x402Client } from "@x402-avm/core/client";
import { x402HTTPClient } from "@x402-avm/core/http";
import { ExactAvmScheme } from "@x402-avm/avm/exact/client";
import { ALGORAND_TESTNET_CAIP2, type ClientAvmSigner } from "@x402-avm/avm";
import algosdk from "algosdk";
import dotenv from "dotenv";

const debug = false;

dotenv.config();    

// Get user account from environment variable
const userSecretKey = Buffer.from(process.env.AVM_PRIVATE_KEY!, "base64");
const userAddress = algosdk.encodeAddress(userSecretKey.slice(32));

// Implement ClientAvmSigner 
 const signer: ClientAvmSigner = {
    address: userAddress,
    signTransactions: async (txns, indexesToSign) => {
      return txns.map((txn, i) => {
        if (indexesToSign && !indexesToSign.includes(i)) return null;
        const decoded = algosdk.decodeUnsignedTransaction(txn);
        const signed = algosdk.signTransaction(decoded, userSecretKey);
        return signed.blob;
      });
    },
  };

// Create core client and register payment schemes
const coreClient = new x402Client()
  .register(ALGORAND_TESTNET_CAIP2, new ExactAvmScheme(signer));

// Wrap with HTTP client for header encoding/decoding
const client = new x402HTTPClient(coreClient);

// Make a request
const response = await fetch('http://localhost:4021/weather_paid');

if (response.status === 402) {
  // Extract payment requirements from response
  const paymentRequired = client.getPaymentRequiredResponse(
    (name) => response.headers.get(name),
    await response.json()
  );
  
  // Create and send payment
  const paymentPayload = await client.createPaymentPayload(paymentRequired);
  
  const paidResponse = await fetch('http://localhost:4021/weather_paid', {
    headers: client.encodePaymentSignatureHeader(paymentPayload),
  });
  if (debug) console.log('paidResponse:', paidResponse);
  
  // Get settlement confirmation
  const settlement = client.getPaymentSettleResponse(
    (name) => paidResponse.headers.get(name)
  );
  if (debug) console.log('settlement:', settlement);

  // Get the actual response data
  const data = await paidResponse.json();
  console.log('Data:', data);
}