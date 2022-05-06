const Blockchain = require("./6.prooOfWork");
const bitcoin = new Blockchain();

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
    recipient: "mnb1d23",
  },
];

const nonce = bitcoin.pow(previousBlockHash, currentBlockData);
console.log(nonce);
