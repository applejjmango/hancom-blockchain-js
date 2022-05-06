const { v4: uuidv4 } = require("uuid");

const Blockchain = require("./blockchain");

const express = require("express");
const { fdatasyncSync } = require("fs");
const app = express();

// Middleware configuration
app.use(express.json());

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

app.listen(8000, () => {
  console.log("Listening on port 8000");
});
