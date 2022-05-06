const Blockchain = require("./3.getLastBlock");
const bitcoin = new Blockchain();

bitcoin.createNewBlock("sdggdsgwer123412", "gsdgds232432", 100);
bitcoin.createNewBlock("gsdgfdgfdsg", "gsdgds232432", 300);
bitcoin.createNewBlock("sdggdsgwerhffdsg123412", "gsdgds232432", 500);

console.log(bitcoin.getLastBlock());
