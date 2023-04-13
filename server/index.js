const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, hexToBytes, bytesToHex } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");

app.use(cors());
app.use(express.json());

const balances = {
  "049a0fd91b40b3d253a68889fbbd63f0aaab478481fb6674a6019a5bd9582bbbd3dece95a9393d72888c8cd5628a67b8b2ec991ae3efa7c306b558725621cafa58": 100,
  "04cc779d9894f160becc02f91d0b915be09e67fa5e658f926213012eaa581d62d9afee768d92529189eeaea02b081513e5874a913aad817af412056d1b00ec09de": 50,
  "044f307d3792b0af09804f8476aff501904ebb554760084085212422cf966532ca83afa21676f91682b01d2ae13ed9de42c71e31741a2fdc60368441751aaeaa0d": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  //TODO: get a signature from client side app
  //recover the public adress from signature
  //console.log(req.body);
  const { sender, recipient, amount, signature, recoveryBit } = req.body;

  const shash = keccak256(utf8ToBytes("TRANSFER")); //to secure by transactionType
  const sSignature = hexToBytes(signature);
  console.log(sSignature)
  senderRecovered = bytesToHex(secp.recoverPublicKey(shash, sSignature ,recoveryBit));
  
  if (senderRecovered != sender) {
    res.status(400).send({ message: "Invalid Signature or Invalid Transaction Type" });
  }
  else{
    console.log(senderRecovered);
  }
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
