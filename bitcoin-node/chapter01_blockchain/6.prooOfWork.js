const { v4: uuidv4 } = require("uuid");
const sha256 = require("sha256");

class Blockchain {
  constructor() {
    this.chain = [];
    this.pendingTxs = []; // 멤풀이라고 한다. 멤풀은 트랜잭션이 머무르는 대기 공간이다.

    // Genesis Block(블록체인의 가장 첫 번째 블록)을 생성하는 코드
    this.createNewBlock("", "", 0);
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
  createNewTransaction(amount, sender, recipient) {
    const newTransaction = {
      transactionId: uuidv4().split("-").join(""),
      amount: amount,
      sender: sender,
      recipient: recipient,
    };
    this.pendingTxs.push(newTransaction);

    // 해당(새롭게 만든) 트랜잭션이 몇 번째 블록에서 추가 되었는지 알려주는 코드이다.
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
    while (!hashVal.startsWith("0000")) {
      nonce++;
      hashVal = this.hashBlock(previousBlockHash, currentBlockData, nonce);
      console.log("hashVal", hashVal);
    }
    return nonce;
  }
}

module.exports = Blockchain;
