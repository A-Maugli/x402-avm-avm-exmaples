import sdk from "algosdk";

let account = sdk.generateAccount();
console.log("Address:", account.addr.toString());
console.log("Mnemonic:", sdk.secretKeyToMnemonic(account.sk)); 
console.log("Private Key (Base64):", Buffer.from(account.sk).toString("base64"));