import sdk from "algosdk";
import * as fs from 'fs';
import * as util from 'util';

const logFile = fs.createWriteStream('algorand-account.log', { flags: 'a' }); // 'a' = append
const logStdout = process.stdout;

// expand console.log
const originalConsoleLog = console.log;
console.log = function(...args: any[]) {
    // Write to log file
    logFile.write(util.format.apply(null, args) + '\n');
    // Write to console
    logStdout.write(util.format.apply(null, args) + '\n');
};

let account = sdk.generateAccount();
console.log("Address:", account.addr.toString());
console.log("Mnemonic:", sdk.secretKeyToMnemonic(account.sk)); 
console.log("Private Key (Base64):", Buffer.from(account.sk).toString("base64"));