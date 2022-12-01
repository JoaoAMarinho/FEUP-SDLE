// server/index.js
import { Node } from "./src/node.js";

const PORT = process.env.PORT || 3001;

new Node(PORT);
