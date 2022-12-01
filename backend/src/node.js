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
import { str2array, array2str } from "./utils.js";
import fs from "fs";
import { createHash } from "crypto";
import Router from "./router.js";
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

const bootstrapers = [
    "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
    "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
];

export class Node {
  constructor(port, username) {
      this.port = Router.createPort(this, port);
      this.createNode();
      this.username = username;

    }

    nodeThings = async () => {
        const peerId = await createRSAPeerId();

        const peerIdJson = JSON.stringify(peerId.toJSON());
        fs.writeFile("peer.txt", peerIdJson, (err) => {
            console.log(err);
        });

        node = await createNode(peerId);

        // node.addEventListener('peer:discovery', (event) => {
        //     // No need to dial, autoDial is on
        //     console.log('Discovered:', event.detail.id.toString())
        //     login(node, "/key")
        // })
        // // console.log(data)
        // register(node, "/key", "test")
        return node;
    };

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
          this.node.addEventListener('peer:discovery', this.sharePort)
        }
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
        password = createHash("sha256").update(password).digest("hex");

        try {
            const data = await this.node.contentRouting.get(
                str2array(username)
            );
            const content = JSON.parse(array2str(data));
            if (content.password !== password) {
                return { error: "Invalid password!" };
            }
            // TODO fix this must not be a return from the method port,  and username should not be passed like this I think!!
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
        const port = await portPromise

        // TODO fix this must not be a return from the method!!
        return { port: port };
    };


    register = async (username, password) => {
        if(!this.node.isStarted()){
          return {error: "Node starting"}
        }
        const usernameArray = str2array(username);
        try {
            await this.node.contentRouting.get(usernameArray);
            return { error: "User already exists!" };
        } catch (err) {
            // do nothing
        }

        password = createHash("sha256").update(password).digest("hex");
        const content = {
            password: password,
        };

        await this.node.contentRouting.put(
            usernameArray,
            str2array(JSON.stringify(content))
        );
        return { success: "User created!" };
    };
}
