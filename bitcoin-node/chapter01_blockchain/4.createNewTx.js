const { v4: uuidv4 } = require("uuid");

class Blockchain {
  constructor() {
    this.chain = [];
    // Txs => Transactions
    // mempool
    this.pendingTxs = [];

    // Create a Genesis Block
    this.createNewBlock("00000", "gsdlkdfrwetwe123", 0);
  }

  createNewBlock(parentHash, hash, nonce) {
    const newBlock = {
      index: this.chain.length,
      timestamp: Date.now(),
      parentHash: parentHash,
      hash: hash,
      nonce: nonce,
      transactions: this.pendingTxs,
    };
    this.chain.push(newBlock);
    this.pendingTxs = [];

    return newBlock;
  }

  // Get a last block
  getLastBlock() {
    return this.chain[this.chain.length - 1];
  }

  // 새로운 트랜잭션을 생성하는 코드
  createNewTransaction(amount, sender, recipient) {
    const newTransaction = {
      // uuidv4() => '109156be-c4fb-41ea-b1b4-efe1671c5836'
      transactionId: uuidv4().split("-").join(""),
      amount: amount,
      sender: sender,
      recipient: recipient,
    };
    this.pendingTxs.push(newTransaction);

    // 해당(새롭다 만든) 트랜잭션이 몇 번째 블록에서 추가 되었는지 알려주는 코드이다
    return this.getLastBlock()["index"] + 1;
  }
}

module.exports = Blockchain;
