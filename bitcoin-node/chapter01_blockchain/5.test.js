const Blockchain = require("./5.hashBlock");
const bitcoin = new Blockchain();

bitcoin.createNewBlock("sdggdsgwer123412", "gsdgds232432", 100);

const previousBlockHash = "gbergre234vfdvredsf";

const currentBlockData = [
  {
    amount: 10,
    sender: "abcd123",
    recipient: "def123",
  },
  {
    amount: 5,
    sender: "zef123",
    recipient: "dfsdf123",
  },
  {
    amount: 100,
    sender: "qewer123",
    recipient: "mnb123",
  },
];

const nonce = 3000;

const hashBlock = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
console.log(hashBlock);
