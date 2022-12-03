// server/index.js
import { Node } from "./src/node.js";

const PORT = process.env.PORT || 3001;

const node = new Node();
await node.init(PORT);

node.loadAccounts();
