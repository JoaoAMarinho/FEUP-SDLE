import fs from "fs";
import { str2array, hash } from "./utils.js";

export default class Persistency {
    static loadAccounts() {
        const dir = "./users";
        const usersFile = `./users/accounts.txt`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(usersFile)) return;
        return JSON.parse(fs.readFileSync(usersFile));
    }

    static loadTimeline(node) {
        const dir = "./posts";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            return [];
        }

        const postsFile = `${dir}/${hash(node.username)}.txt`;
        if (!fs.existsSync(postsFile)) return [];

        return JSON.parse(fs.readFileSync(postsFile));
    }

    static saveUser(user) {
        const dir = "./users";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const usersFile = `${dir}/accounts.txt`;
        let users = [];
        if (fs.existsSync(usersFile))
            users = JSON.parse(fs.readFileSync(usersFile));
        users.push(user);
        fs.writeFileSync(usersFile, JSON.stringify(users));
    }

    static saveTimeline(timeline) {
        const dir = "./posts";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        fs.writeFileSync(
            `./post/${this.getUserHash()}.txt`,
            JSON.stringify(timeline)
        );
    }
}
