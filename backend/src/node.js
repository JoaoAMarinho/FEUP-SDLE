import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { kadDHT } from "@libp2p/kad-dht";
import { pipe } from "it-pipe";
import { CID } from "multiformats/cid";
import { mdns } from "@libp2p/mdns";
import { peerIdFromString } from "@libp2p/peer-id";
import delay from "delay";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import {
    createRSAPeerId,
    createFromJSON,
    exportToProtobuf,
    createFromProtobuf,
} from "@libp2p/peer-id-factory";
import { str2array, array2str, hash } from "./utils.js";
import fs, { writeFile } from "fs";
import Router from "./router.js";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";

export class Node {
    constructor(port, username = "default") {
        this.port = Router.createPort(this, port);
        this.createNode();
        this.username = username;
        this.timeline = [];
        this.feed = {};
        this.followers = [];
        this.following = [];
    }

    getUserHash() {
        return hash(this.username);
    }

    createNode = async () => {
        this.node = await createLibp2p({
            addresses: {
                // add a listen address (localhost) to accept TCP connections on a random port
                listen: ["/ip4/0.0.0.0/tcp/0"],
            },
            transports: [tcp()],
            streamMuxers: [mplex()],
            connectionEncryption: [noise()],
            dht: kadDHT(),
            peerDiscovery: [
                mdns({
                    interval: 10e3,
                }),
            ],
            pubsub: gossipsub({ allowPublishToZeroPeers: true }),
        });

        // start libp2p
        await this.node.start();

        console.log("Node created!", this.node.peerId.toString());

        // Wait for onConnect handlers in the DHT
        await delay(1000);

        if (this.port !== 3001) {
            this.node.addEventListener("peer:discovery", this.sharePort);
            this.node.addEventListener("peer:discovery", this.updateDht);
            // this.node.addEventListener('peer:discovery', this.updateDht);
        }

        //Set route to receive follow requests
        this.node.handle(["/follow"], (data) => {
            const peerId = data.connection.remotePeer;
            pipe(data.stream, async (source) => {
                for await (const msg of source) {
                    const str = JSON.parse(uint8ArrayToString(msg.subarray()));
                    console.log(
                        `from: ${data.stream.stat.protocol}, msg: ${str}`
                    );
                    this.followers.push(str.username);
                    this.sharePosts(peerId);
                }
            }).finally(() => {
                // clean up resources
                data.stream.close();
            });
        });

        //Set route to receive unfollow requests
        this.node.handle(["/unfollow"], (data) => {
            pipe(data.stream, async (source) => {
                for await (const msg of source) {
                    const str = JSON.parse(uint8ArrayToString(msg.subarray()));
                    console.log(
                        `from: ${data.stream.stat.protocol}, msg: ${str}`
                    );
                    const index = this.followers.indexOf(str.username);
                    this.followers.splice(index, 1);
                }
            }).finally(() => {
                // clean up resources
                data.stream.close();
            });
        });

        // print out listening addresses
        // console.log("Listening on addresses:");
        // this.node.getMultiaddrs().forEach((addr) => {
        //     console.log(addr.toString());
        // });
    };

    updateDht = async (evt) => {
        const key = str2array(this.username);

        let data = {};
        try {
            data = await this.node.contentRouting.get(key);
            data = JSON.parse(array2str(data));
        } catch (_) {
            // do nothing
        }

        data.peerId = this.node.peerId.toString();
        await this.node.contentRouting.put(
            key,
            str2array(JSON.stringify(data))
        );
        this.node.removeEventListener("peer:discovery", this.updateDht);
    };

    sharePort = async (evt) => {
        try {
            const stream = await this.node.dialProtocol(evt.detail.id, [
                `/port/${this.username}`,
            ]);
            pipe([uint8ArrayFromString(this.port.toString())], stream).finally(
                this.node.removeEventListener("peer:discovery", this.sharePort)
            );
        } catch (err) {}
    };

    stopNode = async () => {
        // stop libp2p
        await this.node.stop();
        console.log("Node has stopped!");
    };

    login = async (username, password) => {
        if (!this.node.isStarted()) {
            return { error: "Node starting" };
        }
        password = hash(password);

        try {
            const data = await this.node.contentRouting.get(
                str2array(username)
            );
            const content = JSON.parse(array2str(data));
            if (content.password !== password) {
                return { error: "Invalid password!" };
            }
        } catch (err) {
            console.log(err.code);
            return { error: "Username does not exist!" };
        }

        let portPromise = new Promise((resolve) => {
            this.node.handle([`/port/${username}`], ({ stream }) => {
                pipe(stream, async function (source) {
                    for await (const msg of source) {
                        const str = uint8ArrayToString(msg.subarray());
                        console.log(
                            `from: ${stream.stat.protocol}, msg: ${str}`
                        );
                        resolve(parseInt(str));
                    }
                }).finally(() => {
                    // clean up resources
                    stream.close();
                    this.node.unhandle([`/port/${username}`]);
                });
            });
        });

        new Node(0, username);
        const port = await portPromise;

        return { port: port };
    };

    logout = async () => {
        if (!this.node.isStarted()) {
            return { error: "Node starting" };
        }

        const key = str2array(this.username);
        let data = await this.node.contentRouting.get(key);
        data = JSON.parse(array2str(data));
        delete data["peerId"];
        await this.node.contentRouting.put(
            key,
            str2array(JSON.stringify(data))
        );

        await this.stopNode();

        return { success: "User logout!" };
    };

    register = async (username, password) => {
        if (!this.node.isStarted()) {
            return { error: "Node starting" };
        }

        const usernameArray = str2array(username);
        try {
            await this.node.contentRouting.get(usernameArray);
            return { error: "User already exists!" };
        } catch (_) {
            // do nothing
        }

        // Register user + pass in DHT of user entry
        password = hash(password);
        const content = {
            password: password,
        };
        await this.node.contentRouting.put(
            usernameArray,
            str2array(JSON.stringify(content))
        );

        //Register user in DHT of users list
        const key = str2array("users");
        let data = [];
        try {
            data = await this.node.contentRouting.get(key);
            data = JSON.parse(array2str(data));
        } catch (_) {
            // do nothing
        }

        data.push(username);
        await this.node.contentRouting.put(
            key,
            str2array(JSON.stringify(data))
        );

        return { success: "User created!" };
    };

    post = (message) => {
        if (!this.node.isStarted()) {
            return { error: "Node starting" };
        }
        var dir = "./post";

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        const messageObject = {
            username: this.username,
            message: message,
            date: Date.now(),
        };

        this.timeline.push(messageObject);
        fs.writeFileSync(
            `./post/${this.getUserHash()}.txt`,
            JSON.stringify(this.timeline)
        );

        //share message with followers
        const topic = `feed/${this.getUserHash()}`;
        this.node.pubsub.publish(
            topic,
            str2array(JSON.stringify(messageObject))
        );
    };

    follow = async (username) => {
        if (!this.node.isStarted()) {
            return { error: "Node starting" };
        }

        if (this.followers.includes(username)) {
            return { error: "Already following user!" };
        }

        const usernameArray = str2array(username);
        try {
            const data = await this.node.contentRouting.get(usernameArray);
            const content = JSON.parse(array2str(data));

            this.feed[username] = [];
            const topic = `feed/${hash(username)}`;

            this.node.pubsub.addEventListener("message", (evt) => {
                const msg = JSON.parse(array2str(evt.detail.data));
                this.feed[username].push(msg);
            });
            this.node.pubsub.subscribe(topic);
            this.following.push(username);

            const { peerId } = content;

            const bytes = json.encode(`/posts/${hash(username)}`);
            const hash = await sha256.digest(bytes);
            const cid = CID.create(1, json.code, hash);

            let posts = this.handleReceivePosts(username);

            if (peerId) {
                const peerID = peerIdFromString(peerId);
                const peerInfo = await this.node.peerRouting.findPeer(peerID);

                console.log("Send Follow Request");
                this.sendFollow(peerInfo.id, username);
                await posts;
            } else {
                console.log("User not online");

                // Ask for user posts to providers
                const providers = await all(this.node.contentRouting.findProviders(cid, { timeout: 3000 }));
                if (providers.length > 0) {
                    const peerInfo = providers[0];
                    console.log("Send Request Posts");
                    // this.sendFollow(peerInfo.id, username);
                    await posts;
                } else {
                    console.log("No followers online")
                    posts = [];
                }
            }

            this.feed[username].push(...posts);

            this.providePosts(cid);

            this.feed[username] = posts;

            return { posts: posts };
        } catch (err) {
            console.log(err);
            return { error: "User does not exist!" };
        }
    };

    unfollow = async (username) => {
        if (!this.node.isStarted()) {
            return { error: "Node starting" };
        }

        if (!this.following.includes(username)) {
            return { error: "Not following user!" };
        }

        const usernameArray = str2array(username);
        try {
            const data = await this.node.contentRouting.get(usernameArray);
            const content = JSON.parse(array2str(data));
            console.log(content);

            const topic = `feed/${hash(username)}`;
            this.node.pubsub.unsubscribe(topic);

            const index = this.following.indexOf(username);
            if (index == -1) return { error: `Not subscribed to ${username}` };
            this.following.splice(index, 1);

            const { peerId } = content;

            if (peerId) {
                const peerID = peerIdFromString(peerId);
                const peerInfo = await this.node.peerRouting.findPeer(peerID);

                console.log("Send Unfollow");
                this.sendUnfollow(peerInfo.id, username);

                return { success: "Unfollow successful." };
            }

            console.log("User not online");
            return { success: "Unfollow successful." };
        } catch (err) {
            console.log(err);
            return { error: "User does not exist!" };
        }
    };

    handleReceivePosts = async (username) => {
        return new Promise((resolve) => {
            this.node.handle([`/posts/${hash(username)}`], (data) => {
                pipe(data.stream, async function (source) {
                    for await (const msg of source) {
                        const str = uint8ArrayToString(msg.subarray());
                        console.log(
                            `from: ${data.stream.stat.protocol}, msg: ${str}`
                        );
                        resolve(str);
                    }
                }).finally(() => {
                    data.stream.close();
                    this.node.unhandle([`/posts/${hash(username)}`]);
                });
            });
        });
    };

    sendFollow = async (peerId, username) => {
        try {
            const stream = await this.node.dialProtocol(peerId, [`/follow`]);
            const content = {
                data: Date.now().toString(),
                username: this.username,
            };
            pipe([uint8ArrayFromString(JSON.stringify(content))], stream);
        } catch (err) {
            console.log(
                `Error following ${username}. Unable to get posts.`,
                err
            );
        }
    };

    sendUnfollow = async (peerId, username) => {
        try {
            const stream = await this.node.dialProtocol(peerId, [`/unfollow`]);
            const content = {
                data: Date.now().toString(),
                username: this.username,
            };
            pipe([uint8ArrayFromString(JSON.stringify(content))], stream);
        } catch (err) {
            console.log(`Error unfollowing ${username}.`, err);
        }
    };

    sharePosts = async (peerInfo) => {
        try {
            const stream = await this.node.dialProtocol(peerInfo, [
                `/posts/${hash(this.username)}`,
            ]);
            pipe([uint8ArrayFromString(JSON.stringify(this.timeline))], stream);
        } catch (err) {
            console.log("Error sharing posts.", err);
        }
    };

    shareFollowingPosts = async (peerInfo, username) => {
        try {
            const stream = await this.node.dialProtocol(peerInfo, [
                `/posts/${hash(username)}`,
            ]);
            const content = this.feed[username] ? this.feed[username] : [];
            pipe([uint8ArrayFromString(JSON.stringify(content))], stream);
        } catch (err) {
            console.log("Error sharing posts.", err);
        }
    };

    providePosts = async (cid) => {
        await this.node.contentRouting.provide(cid);
    };

    listUsers = async () => {
        const key = str2array("users");
        let usernames = await this.node.contentRouting.get(key);
        usernames = JSON.parse(array2str(usernames));

        const idx = usernames.indexOf(this.username);
        if (idx > -1) usernames.splice(idx, 1);

        let response = [];
        for (let username of usernames) {
            response.push({
                username: username,
                following: this.following.includes(username),
            });
        }

        return response;
    };
}
