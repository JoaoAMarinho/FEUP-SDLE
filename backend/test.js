/* eslint-disable no-console */

import { createLibp2p } from "libp2p";
import { tcp } from "@libp2p/tcp";
import { mplex } from "@libp2p/mplex";
import { noise } from "@chainsafe/libp2p-noise";
import { floodsub } from "@libp2p/floodsub";
import { gossipsub } from "@chainsafe/libp2p-gossipsub";
import { fromString as uint8ArrayFromString } from "uint8arrays/from-string";
import { toString as uint8ArrayToString } from "uint8arrays/to-string";
import delay from "delay";
import { pubsubPeerDiscovery } from "@libp2p/pubsub-peer-discovery";
import { mdns } from "@libp2p/mdns";

const createNode = async () => {
  const node = await createLibp2p({
    addresses: {
      listen: ["/ip4/0.0.0.0/tcp/0"],
    },
    transports: [tcp()],
    streamMuxers: [mplex()],
    connectionEncryption: [noise()],
    peerRouting: {
      // Peer routing configuration
      refreshManager: {
        // Refresh known and connected closest peers
        enabled: true, // Should find the closest peers.
        interval: 6e5, // Interval for getting the new for closest peers of 10min
        bootDelay: 10e3, // Delay for the initial query for closest peers
      },
    },
    pubsub: gossipsub({
      allowPublishToZeroPeers: true,
      fallbackToFloodsub: true,
    }),
    peerDiscovery: [
      pubsubPeerDiscovery({ interval: 5000 }),
      mdns({
        interval: 10e3,
      }),
    ],
  });

  return node;
};

(async () => {
  const topic = "news";

  const [node1, node2] = await Promise.all([createNode(), createNode()]);

  node1.start();
  node2.start();

  await delay(1000);

  // Add node's 2 data to the PeerStore
  // await node1.peerStore.addressBook.set(node2.peerId, node2.getMultiaddrs())
  // await node1.dial(node2.peerId)

  node1.pubsub.subscribe(topic);
  node1.pubsub.addEventListener("message", (evt) => {
    if (evt.detail.topic === topic) {
      console.log(
        `node1 received: ${uint8ArrayToString(evt.detail.data)} on topic ${
          evt.detail.topic
        }`
      );
    }
  });

  // Will not receive own published messages by default
  node2.pubsub.subscribe(topic);
  node2.pubsub.addEventListener("message", (evt) => {
    if (evt.detail.topic === topic) {
      console.log(
        `node2 received: ${uint8ArrayToString(evt.detail.data)} on topic ${
          evt.detail.topic
        }`
      );
    }
  });

  console.log("exec");
  // node2 publishes "news" every second
  setInterval(() => {
    console.log("run");
    // console.log(node2.pubsub.dumpPeerScoreStats())
    // console.log(node2.pubsub.getPeers())
    // console.log(node2.pubsub.getMeshPeers(topic))
    // console.log(node2.pubsub.getTopics())
    node2.pubsub
      .publish(topic, uint8ArrayFromString("Bird bird bird, bird is the word!"))
      .catch((err) => {
        console.error(err);
      });
  }, 50000);

  // setInterval(() => {
  //     console.log("done")
  // }, 50000)
})();
