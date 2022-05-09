const { v4: uuidv4 } = require("uuid");
const express = require("express");
const rp = require("request-promise");

const Blockchain = require("./blockchain");

const app = express();

// Middleware configuration
app.use(express.json());

const port = process.argv[2];

const bitcoin = new Blockchain();

app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

app.post("/transaction/broadcast", (req, res) => {
  const body = req.body;

  const newTx = bitcoin.createNewTransaction(body.amount, body.sender, body.recipient);
  bitcoin.addNewTxToPendingTx(newTx); // 현재 노드의 Mempool 생성된 트랜잭션 담기

  const requestPromise = [];

  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/transaction",
      method: "POST",
      body: newTx,
      json: true,
    };

    requestPromise.push(rp(requestOptions));
  });

  Promise.all(requestPromise).then((data) => {
    res.json({
      msg: "Transaction created and broadcast successfully",
    });
  });
});

// Refactoring
app.post("/transaction", (req, res) => {
  const newTx = req.body;

  // if body contains nothings, send an error msg

  if (Object.entries(newTx).length > 0) {
    const blockIndex = bitcoin.addNewTxToPendingTx(newTx);
    res.json({
      msg: `The new transaction will be added in block ${blockIndex}`,
    });
  } else {
    res.json({
      msg: "No transaction data",
    });
  }
});

// Create a new Block
app.get("/mine", (req, res) => {
  const nodeAddress = uuidv4().split("-").join("");

  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];

  const currentBlockData = {
    transactions: bitcoin.pendingTxs,
    index: lastBlock["index"] + 1,
  };

  const nonce = bitcoin.pow(previousBlockHash, currentBlockData);

  const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = bitcoin.createNewBlock(previousBlockHash, blockHash, nonce);

  const requestPromises = [];
  // 다른 노드들에게 새로운 블록이 만들어졌다고 요청하는 부분
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/receive-new-block",
      method: "POST",
      body: { newBlock: newBlock },
      json: true,
    };

    requestPromises.push(rp(requestOptions));
  });

  // 새로운 블록을 생성하기 위해 블록 리워드 전파
  Promise.all(requestPromises)
    .then((data) => {
      const requestOptions = {
        uri: bitcoin.currentNodeUrl + "/transaction/broadcast",
        method: "POST",
        body: {
          amount: 50,
          sender: "00",
          recipient: nodeAddress,
        },
        json: true,
      };
      return rp(requestOptions);
    })

    .then((data) => {
      res.json({
        msg: "New block mined and broadcast successfully",
        block: newBlock,
      });
    });
});

// Refactoring
app.post("/receive-new-block", (req, res) => {
  // To validate a valid block, we need to check 1. hash 2. index(number)
  const newBlock = req.body.newBlock;
  console.log("newBlock => ", newBlock);
  const lastBlock = bitcoin.getLastBlock();

  const validHash = lastBlock["hash"] === newBlock["previousBlockHash"];
  const validIndex = lastBlock["index"] + 1 === newBlock["index"];

  console.log("Both true", validHash, validIndex);

  if (validHash && validIndex) {
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTxs = [];

    res.json({
      msg: "New block received and accepted",
      newBlock: newBlock,
    });
  } else {
    res.json({
      msg: "New block rejected",
      newBlock: newBlock,
    });
  }
});

// 1. 노드 간의 서로 연결되어 분산 네트워크 구축을 위한 엔드포인트입니다.
app.post("/node/registration-broadcasting", (req, res) => {
  // 2. 한 노드에서 새로운 노드를 바디에 실어서 보내는 코드입니다.
  const newNodeUrl = req.body.newNodeUrl;

  // 3. 현재 네트워크노드 어레이에서 새로운 노드 url이 포함되어 있지 않다면
  // 새로운 노드 url을 networkNodes 어레이어 푸쉬하는 과정입니다.
  if (!bitcoin.networkNodes.includes(newNodeUrl)) {
    bitcoin.networkNodes.push(newNodeUrl);
  }

  const nodeRegCompleted = [];

  // 4. networkNodes에 포함된 모든 노드에게 새로운 노드가 등록 됬음을 전파하기 위해서
  // 네트워크노드에 있는 노드를 하나 하나 for 문으로 순회하면서 /node/registration 엔드포인트
  // 에 접근하도록 합니다. /node/registration 엔드포인트 코드를 보시죠.

  // NetworkNodes에 포함된 모든 노드에게 새로운 노드 전파하기
  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/node/registration",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true,
    };

    // 6. RequestOptions를 rp로 보내는 데 여기서 rp는 네트워크에서 통신하는 PROMISE 비동기 전송 방식입니다.
    // 네트워크에 걸쳐있는 노드에게 새로운 노드 정보를 전송할 때 언제 도착하는지 알 수 없기 때문에
    // 비동기 방식인 rp로 처리하고 이 결과를 nodeRegCompleted라는 배열에 푸십합니다.
    nodeRegCompleted.push(rp(requestOptions));
  });

  // 7. 마지막으로 nodeRegCompleted 배열을 promise then을 통해서 모든 node 등록 정보를
  // 한 꺼번에 담는 코드입니다. /node/registration/all 코드를 잠깐 보시죠
  Promise.all(nodeRegCompleted)
    .then((data) => {
      const allRegistrationOpt = {
        uri: newNodeUrl + "/node/registration/all",
        method: "POST",
        body: { allNetworkNodes: [...bitcoin.networkNodes, bitcoin.currentNodeUrl] },
        json: true,
      };

      return rp(allRegistrationOpt);
    })

    // 9. 모든 노드가 서로 싱크를 맞추는데 성공하면 새로운 노드가 성공적으로 등록되었다는 메시지를 반환합니다.
    // 마찬가지로 여기서도 then catch를 통해 노드가 도착하지 않았을 경우 발생할 수 있는
    // 에러 코드는 없는 상태입니다. postman으로 이제 테스트 해보겠습니다.
    .then((data) => {
      res.json({
        msg: "New node registered successfully",
      });
    });
});

app.post("/node/registration", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotInNetwork = !bitcoin.networkNodes.includes(newNodeUrl);
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;

  if (nodeNotInNetwork && notCurrentNode) {
    bitcoin.networkNodes.push(newNodeUrl);
  }

  res.json({
    msg: "Successful new node registration",
  });
});

app.post("/node/registration/all", (req, res) => {
  const allNetworkNodes = req.body.allNetworkNodes;

  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotInNetwork = !bitcoin.networkNodes.includes(networkNodeUrl);
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeUrl;

    if (nodeNotInNetwork && notCurrentNode) {
      bitcoin.networkNodes.push(networkNodeUrl);
    }
  });
  res.json({
    msg: "All nodes synchronized successfully",
  });
});

app.get("/consensus", (req, res) => {
  const requestPromises = [];

  bitcoin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions = {
      uri: networkNodeUrl + "/blockchain",
      method: "GET",
      json: true,
    };

    requestPromises.push(rp(requestOptions));
  });

  Promise.all(requestPromises).then((blockchains) => {
    const currentChainLength = bitcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTxs = null;

    // Loop through all other blockchains to check if which is the longest chain
    blockchains.forEach((blockchain) => {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTxs = blockchain.pendingTxs;
      }
    });

    if (!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))) {
      res.json({
        msg: "Current chain is the longest so it is not replaced",
        chain: bitcoin.chain,
      });
    } else if (newLongestChain && bitcoin.chainIsValid(newLongestChain)) {
      // There is a new longest chain, the replace current node
      bitcoin.chain = newLongestChain;
      bitcoin.pendingTxs = newPendingTxs;

      res.json({
        msg: "This chain has been replaced",
        chain: bitcoin.chain,
      });
    }
  });
});

app.get("/block/:blockHash", (req, res) => {
  const blockHash = req.params.blockHash;
  const correctBlock = bitcoin.getBlockByHash(blockHash);

  res.json({
    block: correctBlock,
  });
});

app.get("/transaction/:transactionId", (req, res) => {
  const transactionId = req.params.transactionId; // ex) transactionId = cb8aadfcade54db7a5031819b0bda048
  const transactionData = bitcoin.getTransaction(transactionId);

  res.json({
    block: transactionData.block,
  });
});

app.get("/address/:address", (req, res) => {
  const address = req.params.address;
  const addressData = bitcoin.getAddressData(address);

  res.json({
    addressData: addressData,
  });
});

app.get("/block-explorer", (req, res) => {
  res.sendFile("./block-explorer/index.html", { root: __dirname });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
