import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// REQUEST HANDLERS

const registerHandler = async (node, req, res) => {
    const { username, password } = req.body;
    console.log(username);

    const response = await node.register(username, password);
    console.log(response);
    if (response.error) return res.status(400).json(response);

    res.status(200).json({
        message: "Registe user",
    });
};

const loginHandler = async (node, req, res) => {
    const { username, password } = req.body;
    const response = await node.login(username, password);
    console.log(response);
    if (response.error) return res.status(400).json(response);

    res.status(200).json({
        message: "Login user",
        port: response.port, // TODO fix this must not be a return from the method!!
    });
};

const logoutHandler = async (req, res) => {};

const followHandler = async (req, res) => {};

const unfollowHandler = async (req, res) => {};

const feedHandler = async (node, req, res) => {
    let feed = "WRONG";
    if (node.port !== 3001)
        feed = "piu piu piu piu piu piu piu piu piu piu piu piu piu a lot";
    res.status(200).json({
        message: "Getting feed",
        feed: feed,
    });
};

const userHandler = async (req, res) => {};

const profileHandler = async (req, res) => {};

// ROUTES

export const setupRoutes = (node, app) => {
    app.get("/api", (req, res) => {
        //node()
        res.json({ message: "hello world!" });
    });

    app.post("/register", (req, res) => {
        registerHandler(node, req, res);
    });
    app.post("/login", (req, res) => {
        loginHandler(node, req, res);
    });
    app.post("/logout", logoutHandler.bind(node));

    app.post("/follow", followHandler.bind(node));
    app.post("/unfollow", unfollowHandler.bind(node));

    app.get("/feed", (req, res) => {
        feedHandler(node, req, res);
    });
    app.get("/user", userHandler.bind(node));
    app.get("/profile", profileHandler.bind(node));
};

export const createPort = (node, port = 0) => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    const backend = app.listen(port, () => {
        console.log(`Backend listening on ${backend.address().port}`);
    });

    setupRoutes(node, app);

    return backend.address().port;
};
