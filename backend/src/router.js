import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

export default class Router {
    // REQUEST HANDLERS
    static async registerHandler(node, req, res) {
        const { username, password } = req.body;

        const response = await node.register(username, password);
        console.log("Register:", response);

        return res.status(response.error ? 400 : 200).json(response);
    }

    static async loginHandler(node, req, res) {
        const { username, password } = req.body;

        const response = await node.login(username, password);
        console.log("Login:", response);

        return res.status(response.error ? 400 : 200).json(response);
    }

    static async logoutHandler(node, req, res) {
        console.log("logout");
        const response = await node.logout();
        console.log(response);
        if (response.error) return res.status(400).json(response);
        res.status(200).json(response);
    }

    static async followHandler(node, req, res) {
        console.log("follow");

        const { username } = req.body;
        const response = await node.follow(username);
        return res.status(200).json(response);
    }

    static async unfollowHandler(node, req, res) {
        console.log("unfollow");

        const { username } = req.body;
        const response = await node.unfollow(username);
        return res.status(200).json(response);
    }

    static async feedHandler(node, _, res) {
        console.log("feed", node.username)
        const feed = [].concat(node.timeline)
        console.log(feed)
        console.log(node.feed)
        Object.values(node.feed).forEach((val) => {
            console.log(val)
            feed.push(...val);
        });
        feed.sort((v1, v2) => v2.date - v1.date);
        
        return res.status(200).json({
            feed: feed,
        });
    }

    static async postHandler(node, req, res) {
        const { message } = req.body;

        const response = node.post(message);
        console.log("Post:", response);

        return res.status(response.error ? 400 : 200).json(response);
    }

    static async usersHandler(node, _, res) {
        const users = await node.listUsers();
        return res.status(200).json(users);
    }

    static async profileHandler(node, _, res) {
        if (node.port !== 3001) {
            console.log("profile");
            const user = {
                username: node.username,
                followers: node.followers,
                following: node.following,
                timeline: node.timeline,
            };
            return res.status(200).json({
                user: user,
            });
        }
        return res.status(400).json({ erro: "Invalid port" });
    }

    // ROUTES
    static setupRoutes(node, app) {
        app.post("/register", (req, res) => {
            this.registerHandler(node, req, res);
        });
        app.post("/login", (req, res) => {
            this.loginHandler(node, req, res);
        });
        app.post("/logout", (req, res) => {
            this.logoutHandler(node, req, res);
        });

        app.post("/follow", (req, res) => {
            this.followHandler(node, req, res);
        });

        app.post("/unfollow", (req, res) => {
            this.unfollowHandler(node, req, res);
        });
        app.get("/feed", (req, res) => {
            this.feedHandler(node, req, res);
        });
        app.post("/post", (req, res) => {
            this.postHandler(node, req, res);
        });
        app.get("/users", (req, res) => {
            this.usersHandler(node, req, res);
        });
        app.get("/profile", (req, res) => {
            this.profileHandler(node, req, res);
        });
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
