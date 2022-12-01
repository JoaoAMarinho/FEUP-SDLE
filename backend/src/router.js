import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

export default class Router {
    // REQUEST HANDLERS
    static async registerHandler(node, req, res) {
        console.log("register")
        const { username, password } = req.body;

        const response = await node.register(username, password);
        console.log(response)

        if (response.error) return res.status(400).json(response);

        res.status(200).json({
            ...response,
        });
    }

    static async loginHandler(node, req, res) {
        console.log("login")
        const { username, password } = req.body;
        const response = await node.login(username, password);
        console.log(response);
        if (response.error) return res.status(400).json(response);

        res.status(200).json({
            message: "Login user",
            port: response.port, // TODO fix this must not be a return from the method!!
        });
    }

    static async logoutHandler(req, res) {}

    static async followHandler(req, res) {}

    static async unfollowHandler(req, res) {}

    static async feedHandler(node, req, res) {
        let feed = "WRONG";
        if (node.port !== 3001)
            feed = "piu piu piu piu piu piu piu piu piu piu piu piu piu a lot";
        res.status(200).json({
            message: "Getting feed",
            feed: feed,
        });
    }

    static async userHandler(req, res) {}

    static async profileHandler(req, res) {}

    // ROUTES
    static setupRoutes(node, app) {
        app.post("/register", (req, res) => {
            this.registerHandler(node, req, res);
        });
        app.post("/login", (req, res) => {
            this.loginHandler(node, req, res);
        });
        app.post("/logout", this.logoutHandler.bind(node));

        app.post("/follow", this.followHandler.bind(node));
        app.post("/unfollow", this.unfollowHandler.bind(node));

        app.get("/feed", (req, res) => {
            this.feedHandler(node, req, res);
        });
        app.get("/user", this.userHandler.bind(node));
        app.get("/profile", this.profileHandler.bind(node));
    }

    static createPort(node, port = 0) {
        const app = express();
        app.use(cors());
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));

        const backend = app.listen(port, () => {
            console.log(
                `Backend listening on PORT: ${backend.address().port}.\n`
            );
        });

        this.setupRoutes(node, app);

        return backend.address().port;
    }
}
