import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { kadDHT } from "@libp2p/kad-dht";
import { pipe } from 'it-pipe'
import { bootstrap } from "@libp2p/bootstrap";
import { mdns } from '@libp2p/mdns'
import {
    createRSAPeerId,
    createFromJSON,
    exportToProtobuf,
    createFromProtobuf,
} from "@libp2p/peer-id-factory";
import { str2array, array2str, hash } from "./utils.js";
import fs, { writeFile } from "fs";
import Router from "./router.js";
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const bootstrapers = [
    "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
];

export class Node {
  constructor(port, username="default") {
      this.port = Router.createPort(this, port);
      this.createNode();
      this.username = username;
      this.timeline = [];
      this.feed = [];
      this.followers = [];
      this.following = [];
    }

    getUserHash(){
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
                // bootstrap({
                //     interval: 60e3,
                //     list: bootstrapers,
                // }),
                mdns({
                    interval: 20e3
                })
            ],
        });

        // start libp2p
        await this.node.start();

        console.log("Node created!", this.node.peerId.toString());

        if(this.port !== 3001){
          this.node.addEventListener('peer:discovery', this.sharePort);
        }

        //Set route to receive follow requests
        this.node.handle(['/follow'], ( data ) => {
          pipe(
            data.stream,
            async function (source) {
              for await (const msg of source) {
                const str = uint8ArrayToString(msg.subarray())
                console.log(`from: ${data.stream.stat.protocol}, msg: ${str}`)
                this.sharePosts(str);
              }
            }
          ).finally(() => {
            // clean up resources
            data.stream.close()
          })
        });

        
        //TODO put peerID
        const content = {
            password: password,
            peerId: this.node.peerId.toString(),
        };

        await this.node.contentRouting.put(
            usernameArray,
            str2array(JSON.stringify(content)),
        );


        
        // print out listening addresses
        // console.log("Listening on addresses:");
        // this.node.getMultiaddrs().forEach((addr) => {
        //     console.log(addr.toString());
        // });
    };

    sharePort = async (evt) => {
      try{
          const stream = await this.node.dialProtocol( evt.detail.id, [`/port/${this.username}`])
          pipe(
              [uint8ArrayFromString(this.port.toString())],
              stream
          )
          .finally(
            this.node.removeEventListener('peer:discovery', this.sharePort)
          )
      }
      catch (err) {
        console.log("Erro sharing port: ", err)
      }
    }

    stopNode = async (node) => {
        // stop libp2p
        await node.stop();
        console.log("Node has stopped!");
    };

    login = async (username, password) => {
        if(!this.node.isStarted()){
          return {error: "Node starting"}
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
          this.node.handle([`/port/${username}`], ( data ) => {
            pipe(
              data.stream,
              async function (source) {
                for await (const msg of source) {
                  const str = uint8ArrayToString(msg.subarray())
                  console.log(`from: ${data.stream.stat.protocol}, msg: ${str}`)
                  resolve(parseInt(str)) 
                }
              }
            ).finally(() => {
              // clean up resources
              data.stream.close()
              this.node.unhandle([`/port/${username}`])
            })
          })
        });

        new Node(0, username);
        const port = await portPromise;

        return { port: port };
    };


    register = async (username, password) => {
        if(!this.node.isStarted()){
          return {error: "Node starting"};
        }
        const usernameArray = str2array(username);
        try {
            await this.node.contentRouting.get(usernameArray);
            return { error: "User already exists!" };
        } catch (err) {
            // do nothing
        }

        password = hash(password);
        const content = {
            password: password,
        };

        await this.node.contentRouting.put(
            usernameArray,
            str2array(JSON.stringify(content))
        );
        return { success: "User created!" };
    };

    post = (message) => {
      if(!this.node.isStarted()){
          return {error: "Node starting"}
      }
      var dir = './post';

      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }

      const messageObject = {
        'message': message,
        'time': Date.now()
      };

      this.timeline.push(messageObject);
      fs.writeFileSync(`./post/${this.getUserHash()}.txt`, JSON.stringify(this.timeline));

      //share message with followers
      const topic = `feed/${this.getUserHash()}`;
      this.node.pubsub.publish(topic, messageObject);
    }

    subscribe = async (username) => {
      if(!this.node.isStarted()){
        return {error: "Node starting"};
      }
      const usernameArray = str2array(username);
      try {
          const data = await this.node.contentRouting.get(usernameArray);
          const content = JSON.parse(array2str(data));
          
          const topic = `feed/${hash(username)}`;
          const handler = (msg) => {
            // msg.data - pubsub data received
            this.feed.push(msg);
          };
    
          this.node.pubsub.on(topic, handler);
          this.node.pubsub.subscribe(topic);

          //TODO get previous posts from user
          const { peerId } = content;
          
          const posts = receivePosts(username);
          this.requestPosts(username);
          
          await posts;
      } catch (err) {
          return { error: "User does not exist!" };
      }
    }

    receivePosts = async (username) => {
      return new Promise((resolve) => {
        this.node.handle([`/posts/${username}`], ( data ) => {
          pipe(
            data.stream,
            async function (source) {
              for await (const msg of source) {
                const str = uint8ArrayToString(msg.subarray())
                console.log(`from: ${data.stream.stat.protocol}, msg: ${str}`)
                resolve(str) 
              }
            }
          ).finally(() => {
            data.stream.close()
            this.node.unhandle([`/posts/${username}`])
          })
        })
      });
    }


    /*
    
    node1 -> sub(node2), setReceivePost(node2), reqPost(node2) -> receivePost(node2)

    node2, setReqPost(node2) -> receiveReqPost(node1) -> sendPost(node2)

    */

    requestPosts = async (username) => {
      try{
          const stream = await this.node.dialProtocol( evt.detail.id, [`/follow`]);
          pipe([uint8ArrayFromString(username.toString())], stream);
      }
      catch (err) {
        console.log(`Error connecting with ${username}. Unable to get posts.`, err)
      }
    }

    sharePosts = async () => {
      try{
          const stream = await this.node.dialProtocol( evt.detail.id, [`/posts/${this.username}`]);
          pipe([uint8ArrayFromString(JSON.stringify(this.timeline))], stream);
      }
      catch (err) {
        console.log("Erro sharing posts: ", err)
      }
    }
}
