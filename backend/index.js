// server/index.js

import express from "express";
import node from "./src/node.js";
import cors from 'cors'

const PORT = process.env.PORT || 3001;


// REQUEST HANDLERS 

const registerHandler = async (req, res) => {
  res.status(200).json({
    message: "Registe user",
    port: createPort()
  })
}

const loginHandler = async (req, res) => {
  res.status(200).json({
    message: "Login user",
    port: createPort()
  })
}

const logoutHandler = async (req, res) => {}

const followHandler = async (req, res) => {}

const unfollowHandler = async (req, res) => {}

const feedHandler = async (req, res) => {
  res.status(200).json({
    message: "Getting feed",
  })
}

const userHandler = async (req, res) => {}

const profileHandler = async (req, res) => {}

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
}

const app = express();
app.use(cors());

// app.get("/api", (req, res) => {
//   res.json({ port: createPort() });
// });
setupRoutes(app)

const backend = app.listen(PORT, () => {
  console.log(`Backend listening on ${backend.address().port}`);
});

const createPort = () => {
  const app = express();
  app.use(cors());

  const backend = app.listen(0, () => {
    console.log(`Backend listening on ${backend.address().port}`);
  });

  setupRoutes(app);
  
  return backend.address().port;
}
