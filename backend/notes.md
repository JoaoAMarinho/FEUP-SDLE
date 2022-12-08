# Global API

https://github.com/libp2p/js-libp2p/blob/master/doc/API.md

# DHT - distributed hash table

### Users list (permanent)

key: "users"
return: [user1,user2]

### User credentials (permanent)

key: username
return: {
password: <hash>,
peerId: <hash> (only available if some node logged in)
}

# MDNS - Multicast DNS

https://github.com/libp2p/js-libp2p/tree/master/examples/discovery-mechanisms#2-multicastdns-to-find-other-peers-in-the-network

Responsible to discover nodes in the network

# PubSub

https://github.com/libp2p/js-libp2p/tree/master/examples/pubsub#publish-subscribe

Responsible to receive posts from the subscribed nodes

### New post

topic: "feed/"hash(username)

# Dial protocol - exchange messages

https://github.com/libp2p/js-libp2p/tree/master/examples/protocol-and-stream-muxing#3-bidirectional-connections

Create "routes" that allow nodes to exchange desired messages

### Receive node port (temporary)

protocol: "/port/"username

Creating node sets handler

Created node tries to connect with protocol

### Inform follow (permanent)

protocol: "follow"

Node always allows a follow dial to be created

Nodes that want to follow must send a message with the current `timestamp`

### Inform post (temporary)

protocol: "/posts/"username

Node that made the follow request handles the connection

Followed node upon receiving follow dial respondes in this temporary dial with all it's messages
