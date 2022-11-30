// server/index.js

import express from "express";
import node from "./src/node.js";
import cors from 'cors'

const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors())

app.get("/api", (req, res) => {
  res.json({ message: "Hello from server!" });
  node();
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

