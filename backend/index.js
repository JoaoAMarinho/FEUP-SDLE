// server/index.js

import express from "express";
import node from "./src/node.js";
import cors from "cors";

const PORT = process.env.PORT || 3001;

let currentNode = null;
node.createNode().then((result) => {
  currentNode = result;
});

// REQUEST HANDLERS

const registerHandler = async (req, res) => {
  const { username, password } = req.body;

  const response = await node.register(currentNode, username, password);

  if (response.hasAttribute("error")) return res.status(400).json(response);

  res.status(200).json({
    message: "Registe user",
    port: createPort(),
  });
};

const loginHandler = async (req, res) => {
  res.status(200).json({
    message: "Login user",
    port: createPort(),
  });
  node();
};

const logoutHandler = async (req, res) => {};

const followHandler = async (req, res) => {};

const unfollowHandler = async (req, res) => {};

const feedHandler = async (req, res) => {
  res.status(200).json({
    message: "Getting feed",
  });
};

const userHandler = async (req, res) => {};

const profileHandler = async (req, res) => {};

// ROUTES

const setupRoutes = (app) => {
  app.get("/api", (req, res) => {
    //node()
    res.json({ message: "hello world!" });
  });

  app.post("/register", registerHandler);
  app.post("/login", loginHandler);
  app.post("/logout", logoutHandler);

  app.post("/follow", followHandler);
  app.post("/unfollow", unfollowHandler);

  app.get("/feed", feedHandler);
  app.get("/user", userHandler);
  app.get("/profile", profileHandler);
};

const createPort = () => {
  const app = express();
  app.use(cors());

  const backend = app.listen(0, () => {
    console.log(`Backend listening on ${backend.address().port}`);
  });

  setupRoutes(app);

  return backend.address().port;
};

const app = express();
app.use(cors());

setupRoutes(app);

const backend = app.listen(PORT, () => {
  console.log(`Backend listening on ${backend.address().port}`);
});
