import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { kadDHT } from '@libp2p/kad-dht'
import { bootstrap } from '@libp2p/bootstrap'
import PeerId from 'peer-id'
import { str2array, array2str } from './utils.js';
import fs from 'fs';

const bootstrapers = [
    '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmZa1sAxajnQjVM8WjWXoMbmPd7NsWhfKsPkErzpm9wGkp',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
    '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt'
  ]

export default async function node() {
    const peerId = await PeerId.create()

    const peerIdJson = JSON.stringify(peerId.toJSON())
    fs.writeFile("peer.txt", peerIdJson, (err) => {
        console.log(err)
    })

    node = await createNode(peerId)

    // node.addEventListener('peer:discovery', (event) => {
    //     // No need to dial, autoDial is on
    //     console.log('Discovered:', event.detail.id.toString())
    //     login(node, "/key")
    // })
    // // console.log(data)
    // register(node, "/key", "test")
    return node
}

const createNode = async (peerId) => {
    const node = await createLibp2p({
        // peerId: peerId,
        addresses: {
            // add a listen address (localhost) to accept TCP connections on a random port
            listen: ['/ip4/127.0.0.1/tcp/0']
        },
        transports: [tcp()],
        streamMuxers: [mplex()],
        connectionEncryption: [noise()],
        dht: kadDHT(),
        peerDiscovery: [
            bootstrap({
                interval: 60e3,
                list: bootstrapers
            })
        ],
    })

    // start libp2p
    await node.start()
    console.log('libp2p has started')

    // print out listening addresses
    console.log('listening on addresses:')
    node.getMultiaddrs().forEach((addr) => {
        console.log(addr.toString())
    })

    return node
}

const stopNode = async (node) => {
    // stop libp2p
    await node.stop()
    console.log('libp2p has stopped')
}

const login = async (node, username) => {
    node.contentRouting.get(str2array(username))
    .then((data) => {
        console.log("login data: ", array2str(data))
    })
    .catch((err) => {
        console.log("login error: ", err)
    })
}

const register = async (node, username, password) => {
    node.contentRouting.put(str2array(username), str2array(password))
    .then((data) => {
        console.log("register data: ", data)
    })
    .catch((err) => {
        console.log("register error: ", err)
    })
}
