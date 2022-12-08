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

  static loadUserInfo(username, following) {
    console.log("Loading user info");

    const type = following ? "following" : "followers";

    let dir = "./users";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
      return [];
    }
    dir += `/${username}`;

    const file = `${dir}/${type}.txt`;

    if (!fs.existsSync(file)) return [];

    return JSON.parse(fs.readFileSync(file));
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

  static updateFollowing(username, following) {
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
    fs.writeFileSync(followingFile, JSON.stringify(following));
  }

  static updateFollowers(username, followers) {
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
    fs.writeFileSync(followersFile, JSON.stringify(followers));
  }

  static saveTimeline(timeline, username) {
    console.log("Save timeline");
    const dir = "./posts";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    fs.writeFileSync(`./posts/${hash(username)}.txt`, JSON.stringify(timeline));
  }

  static appendTestFile = async (file, data) => {
    let dir = "./tests";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    dir = dir + "/" + file

    fs.appendFileSync(
      dir,
      data.toString() + "\n"
    )

  }
}
