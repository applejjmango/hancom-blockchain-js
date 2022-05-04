const { v4: uuidv4 } = require("uuid");
const express = require("express");
const rp = require("request-promise");

const Blockchain = require("./blockchain");

const app = express();

// Middleware configuration
app.use(express.json());

const port = process.argv[2];

const bitcoin = new Blockchain();
const nodeAddress = uuidv4().split("-").join("");

// get => 어떤 데이터를 가져온다
// req => request
// res => response
app.get("/blockchain", (req, res) => {
  res.send(bitcoin);
});

// post => 어떤 데이터를 보낸다.
app.post("/transaction", (req, res) => {
  const data = req.body;
  const blockIndex = bitcoin.createNewTransaction(data.amount, data.sender, data.recipient);
  res.json({
    msg: `Transaction will be added in block ${blockIndex}`,
  });
});

// Create a new Block
app.get("/mine", (req, res) => {
  // 9. 마지막 블록 정보에서 해쉬를 가져오면 이전 블록 해쉬가 됩니다.
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock["hash"];

  // 11. currentBlockData는 pending 트랜잭션 어레이에 담긴 모든 트랜잭션과 인덱스 정보입니다.
  const currentBlockData = {
    transactions: bitcoin.pendingTxs,
    index: lastBlock["index"] + 1,
  };

  // 10. 논스 값을 구하기 위해 pow 메서드를 실행합니다. 인자로는 이전 블록 해쉬 값과 현재 블록 데이터
  // 정보입니다. previousBlockHash는 구혀져있고 currentBlockData 정보만 확인하면 됩니다
  const nonce = bitcoin.pow(previousBlockHash, currentBlockData);

  // 12. 블록해쉬 정보를 구하기 위해 3개의 인자 previousBlockHash, currentBlockData, nonce
  // 를 넣고 hashBlock 메서드를 호출하였습니다.
  const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);

  // 8. 새로운 블록을 생성하기 위해 createNewBlock 메서드를 호출하겠습니다. 인자로는 nonce 값
  // 이전 블록의 해쉬 값, 그리고 마지막으로 현재 블록의 해쉬 값이 들어갑니다. previousBlockHash를
  // 구하기 위해 getLastBlock으로 불러오겠습니다.
  // 13. createNewBlock메서드에 필요한 모든 인자를 구했으니 대입하여 새로운 블록을 생성합니다.
  const newBlock = bitcoin.createNewBlock(previousBlockHash, blockHash, nonce);

  // 14. 마지막으로 블록이 생성될 때마다 코인 보상을 해주는 코드입니다. createNewTx로 새로운 트랜잭션을
  // 생성하는데, 첫 번째 인자인 amount에는 현재 비트코인 보상 기준인 12.5개가 들어 있고 두 번째 인자인
  // sender는 빈 코드로 넣었고 마지막으로 수신자인 recipient에는 앞서서 만든 임의의 노드 주소인
  // nodeAddress를 넣었습니다. 테스트해보면 보상은 펜딩 트랜잭션에 담겨 있다가 다음 블록이 생성되면
  // 새로운 블록으로 보상 트랜잭션이 들어가게 됩니다.
  bitcoin.createNewTransaction(50, "00", nodeAddress);

  res.json({
    note: "New Block mined Successfully",
    isSuccessful: true,
    newBlock: newBlock,
  });
});

// 1. 노드 간의 서로 연결되어 분산 네트워크 구축을 위한 엔드포인트입니다.
app.post("/node/registration-broadcating", (req, res) => {
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

// 5. 새로운 노드를 네트워크 전체에 퍼져있는 노드에게 등록하는 코드입니다.
// 바디로 들어온 새로운 노드 url을 networkNodes에 이미 있는지 파악 및 현재 노드 url과 다르면
// networkNodes 어레이에 새로운 노드를 푸쉬해서 등록합니다. 6번 이동 >
// register a node across network nodes
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

// 8. body에 모든 네트워크 노드를 담아와서 새로 등록된 노드에게 현재 노드들의 정보를 모두 담아주는 코드이다.
// 9번으로 >> register multiple nodes at once
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

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
