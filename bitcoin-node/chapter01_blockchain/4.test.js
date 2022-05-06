const Blockchain = require("./4.createNewTx");
const bitcoin = new Blockchain();

bitcoin.createNewBlock("sdggdsgwer123412", "gsdgds232432", 100);
bitcoin.createNewBlock("gsdgfdgfdsg", "gsdgds232432", 300);
console.log(bitcoin);

bitcoin.createNewTransaction(100, "abc134", "def123");

bitcoin.createNewBlock("sdggdsgwerhffdsg123412", "gsdgds232432", 500);

console.log(bitcoin);
console.log(bitcoin.chain[3]);
