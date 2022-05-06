const { v4: uuidv4 } = require("uuid");
const sha256 = require("sha256");

const currentNodeUrl = process.argv[3];

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTxs = []; // 멤풀이라고 한다. 멤풀은 트랜잭션이 머무르는 대기 공간이다.

    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];

    // Genesis Block(블록체인의 가장 첫 번째 블록)을 생성하는 코드
    this.createNewBlock("", "", 100);
  }

  // 새로운 블록을 만드는 코드
  createNewBlock(previousBlockHash, hash, nonce) {
    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      previousBlockHash: previousBlockHash,
      hash: hash,
      nonce: nonce,
      transactions: this.pendingTxs,
    };
    this.chain.push(newBlock);
    this.pendingTxs = [];

    return newBlock;
  }

  // 마지막 블록을 가져오는 코드
  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // 새로운 트랜잭션을 생성하는 코드
  // Refactoring
  createNewTransaction(amount, sender, recipient) {
    const newTransaction = {
      transactionId: uuidv4().split("-").join(""),
      amount: amount,
      sender: sender,
      recipient: recipient,
    };

    return newTransaction;
  }

  // Refactoring
  addNewTxToPendingTx(newTx) {
    this.pendingTxs.push(newTx);
    return this.getLastBlock()["index"] + 1;
  }

  hashBlock(previousBlockHash, currentBlockData, nonce) {
    const stringData = previousBlockHash + JSON.stringify(currentBlockData) + nonce.toString();
    const hashedData = sha256(stringData);

    return hashedData;
  }
  pow(previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hashVal = this.hashBlock(previousBlockHash, currentBlockData, nonce);

    // while (hashVal.substring(0, 3) !== "000") {
    while (!hashVal.startsWith("00")) {
      nonce++;
      hashVal = this.hashBlock(previousBlockHash, currentBlockData, nonce);
      console.log("hashVal", hashVal);
    }
    return nonce;
  }

  // Check if blockchain is valid or not
  chainIsValid(blockchain) {
    let validChain = true;

    for (let i = 1; i < blockchain.length; i++) {
      const currentBlock = blockchain[i];
      const prevBlock = blockchain[i - 1];

      // Make sure that each block starts with consecutive thw zeros;
      const blockHash = this.hashBlock(
        prevBlock["hash"],
        { transactions: currentBlock["transactions"], index: currentBlock["index"] },
        currentBlock["nonce"]
      );

      if (!blockHash.startsWith("00")) {
        validChain = false;
      }
      console.log("previousBlockHash => ", prevBlock["hash"]);
      console.log("currentBlockHash => ", currentBlock["hash"]);
    }

    // Check Genesis Block validity
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock["nonce"] === 100;
    const correctParentHash = genesisBlock["previousBlockHash"] === "";
    const correctHash = genesisBlock["hash"] === "";
    const correctTxs = genesisBlock["transactions"].length === 0;

    if (!correctNonce || !correctParentHash || !correctHash || !correctTxs) validChain = false;

    return validChain;
  }
}

module.exports = Blockchain;
