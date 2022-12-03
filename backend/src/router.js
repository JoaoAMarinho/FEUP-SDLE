import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

export default class Router {
    // REQUEST HANDLERS
    static async registerHandler(node, req, res) {
        const { username, password } = req.body;

        const response = await node.register(username, password);
        console.log(response);

        if (response.error) return res.status(400).json(response);

        res.status(200).json({
            ...response,
        });
    }

    static async loginHandler(node, req, res) {
        console.log("login");
        const { username, password } = req.body;
        const response = await node.login(username, password);
        console.log(response);
        if (response.error) return res.status(400).json(response);

        res.status(200).json({
            message: "Login user",
            port: response.port, // TODO fix this must not be a return from the method!!
        });
    }

    static async logoutHandler(node, req, res) {
        console.log("logout");
        const response = await node.logout();
        console.log(response);
        if(response.error) return res.status(400).json(response);
        res.status(200).json(response)
    }

    static async followHandler(node, req, res) {
        console.log("follow");

        const { username } = req.body;
        const response = await node.follow(username);
        return res.status(200).json(response);
    }

    static async unfollowHandler(req, res) {}

    static async feedHandler(node, req, res) {
        let feed = "WRONG";
        if (node.port !== 3001)
            feed = node.feed;
        res.status(200).json({
            message: "Getting feed",
            feed: feed,
        });
    }

    static async postHandler(node, req, res) {
        console.log("Post: ", req.body)
        const { message } = req.body;
        node.post(message)
    }

    static async usersHandler(node, req, res) {
        const users = await node.listUsers()
        res.status(200).json(users);
    }

    static async profileHandler(req, res) {}

    // ROUTES
    static setupRoutes(node, app) {
        app.post("/register", (req, res) => {
            this.registerHandler(node, req, res);
        });
        app.post("/login", (req, res) => {
            this.loginHandler(node, req, res);
        });
        app.post("/logout", (req,res) => {
            this.logoutHandler(node, req, res)
        });

        app.post("/follow", (req, res) => {
            this.followHandler(node, req, res);
        });

        app.post("/unfollow", this.unfollowHandler.bind(node));

        app.get("/feed", (req, res) => {
            this.feedHandler(node, req, res);
        });
        app.post("/post", (req, res) => {
            this.postHandler(node, req, res);
        });
        app.get("/users", (req, res) => {
            this.usersHandler(node, req, res);
        })
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
