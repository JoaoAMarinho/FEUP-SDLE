import fs from "fs";
import { hash } from "./utils.js";

export default class Persistency {
    static loadAccounts() {
        console.log("Loading accounts");
        const dir = "./users";
        const usersFile = `./users/accounts.txt`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(usersFile)) return;
        return JSON.parse(fs.readFileSync(usersFile));
    }

    static loadTimeline(node) {
        console.log("Loading timeline");
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
        console.log("Saving user");
        let dir = "./users";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const usersFile = `${dir}/accounts.txt`;
        let users = [];
        if (fs.existsSync(usersFile))
            users = JSON.parse(fs.readFileSync(usersFile));
        users.push(user);
        fs.writeFileSync(usersFile, JSON.stringify(users));

        dir += `/${user.username}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const followingFile = `${dir}/following.txt`;
        const followersFile = `${dir}/followers.txt`;

        if (fs.existsSync(followingFile))
            fs.writeFileSync(followingFile, JSON.stringify("[]"));

        if (fs.existsSync(followersFile))
            fs.writeFileSync(followersFile, JSON.stringify("[]"));
    }

    static updateFollowing(username, followingUser, follow = true) {
        console.log("Update followings");

        let dir = "./users";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        dir += `/${username}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const followingFile = `${dir}/following.txt`;
        let following = [];
        if (fs.existsSync(followingFile))
            following = JSON.parse(fs.readFileSync(followingFile));

        if (follow) {
            following.push(followingUser);
        } else {
            const userIndex = following.indexOf(followingUser);
            if (userIndex != -1) following.splice(userIndex, 1);
        }

        fs.writeFileSync(followingFile, JSON.stringify(following));
    }

    static updateFollowers(username, followerUser, follow = true) {
        console.log("Update followers");

        let dir = "./users";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        dir += `/${username}`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const followersFile = `${dir}/followers.txt`;
        let followers = [];
        if (fs.existsSync(followersFile))
            followers = JSON.parse(fs.readFileSync(followersFile));

        if (follow) {
            followers.push(followerUser);
        } else {
            const userIndex = followers.indexOf(followerUser);
            if (userIndex != -1) followers.splice(userIndex, 1);
        }

        fs.writeFileSync(followersFile, JSON.stringify(followers));
    }

    static saveTimeline(timeline, username) {
        console.log("Save timeline");
        const dir = "./posts";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        fs.writeFileSync(
            `./posts/${hash(username)}.txt`,
            JSON.stringify(timeline)
        );
    }
}
