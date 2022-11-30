import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { noise } from '@chainsafe/libp2p-noise';
import { mplex } from '@libp2p/mplex';
import { kadDHT } from '@libp2p/kad-dht'
import { bootstrap } from '@libp2p/bootstrap'
import PeerId from 'peer-id'
import { str2array } from './utils.js';
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
    const peer = await PeerId.create()
    const peerJson = JSON.stringify(peer.toJSON())
    fs.writeFile("peer.txt", peerJson, (err) => {
        console.log(err)
    })
    let node = await createNode()

    node.addEventListener('peer:discovery', (evt) => {
        // No need to dial, autoDial is on
        console.log('Discovered:', evt.detail.id.toString())
    })
    // console.log(data)
    // getPassword(node, "key")
}

const createNode = async () => {
    const node = await createLibp2p({
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

const getPassword = async (node, username) => {
    node.contentRouting.get(str2array(username))
    .then((data) => {
        console.log(data)
    })
    .catch((err) => {
        console.log(err)
    })
}
