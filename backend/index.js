// server/index.js
import express from 'express';
import cors from 'cors';
import {createlibp2p} from "libp2p";

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors())

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });

});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const startPeer = () => {
  let peer = ""


  return peer
}