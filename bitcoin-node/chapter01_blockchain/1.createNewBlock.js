class Blockchain {
  constructor() {
    this.chain = [];
    // Txs => Transactions
    // mempool
    this.pendingTxs = [];
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
}

module.exports = Blockchain;
