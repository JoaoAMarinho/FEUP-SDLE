import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { kadDHT } from "@libp2p/kad-dht";
import { bootstrap } from "@libp2p/bootstrap";
import { createRSAPeerId } from '@libp2p/peer-id-factory'
import { str2array, array2str } from "./utils.js";
import fs from "fs";
import { createHash } from 'crypto';
import { createPort } from "./router.js";

const bootstrapers = [
  "/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa",
  "/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt",
];

export class Node{

  constructor(port) {
    this.createNode()

    this.port = createPort(this, port)    
  }

  nodeThings = async () => {
    const peerId = await createRSAPeerId()

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
  }

  createNode = async (peerId = null) => {
    let peer = {}
    if (peerId === null) {
      peer = await createRSAPeerId()
    }

    this.node = await createLibp2p({
      peerId: peer,
      addresses: {
        // add a listen address (localhost) to accept TCP connections on a random port
        listen: ["/ip4/127.0.0.1/tcp/0"],
      },
      transports: [tcp()],
      streamMuxers: [mplex()],
      connectionEncryption: [noise()],
      dht: kadDHT(),
      peerDiscovery: [
        bootstrap({
          interval: 60e3,
          list: bootstrapers,
        }),
      ],
    });

    // start libp2p
    await this.node.start();
    console.log("libp2p has started");

    // print out listening addresses
    console.log("listening on addresses:");
    this.node.getMultiaddrs().forEach((addr) => {
      console.log(addr.toString());
    });
  };

  stopNode = async (node) => {
    // stop libp2p
    await node.stop();
    console.log("libp2p has stopped");
  };

  login = async (username, password) => {
    password = createHash("sha256").update(password).digest("hex");
    let res = 0

    try {
        const data = await this.node.contentRouting.get(str2array(username))
        const content = JSON.parse(array2str(data))
        if (content.password !== password) {
          return { error: "Invalid password!" };
        }
        res = new Node(0).port
        
    } catch (err) {
      console.log(err)
      return { error: "Username does not exist!" };
    }

    // TODO fix this must not be a return from the method!!
    return {port: res}
  };

  register = async (username, password) => {
    const usernameArray = str2array(username);

    try {
      await node.contentRouting.get(usernameArray);
      return { error: "Username already used!" };
    } catch (_) {
      // do nothing
    }

    password = createHash('sha256').update(password).digest('hex');
    const peerId = await createRSAPeerId()
    const content = {
      peerId: peerId.toJSON(),
      password: password,
    };

    const val = await this.node.contentRouting.put(usernameArray, str2array(JSON.stringify(content)))
    console.log(val)
    return {}
      // .then((_) => {
      //   return { data: "Successful register." };
      // })
      // .catch((err) => {
      //   console.log(err)
      //   // do nothing
      // });
  };

}

