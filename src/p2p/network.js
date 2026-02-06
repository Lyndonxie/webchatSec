import { joinRoom } from 'trystero/torrent'

export class P2PNetwork {
    constructor(roomName, username, cryptoManager) {
        this.roomName = roomName
        this.username = username
        this.crypto = cryptoManager
        this.room = null
        this.peers = new Map()
        this.handlers = {
            peerJoin: [],
            peerLeave: [],
            message: [],
            connectionStatus: []
        }
    }

    async connect() {
        // Join room using Trystero
        const config = {
            appId: 'chitchatter-nodecrypt-v1'
        }

        this.room = joinRoom(config, this.roomName)

        // Listen for peer connections
        this.room.onPeerJoin((peerId) => {
            this.handlePeerJoin(peerId)
        })

        this.room.onPeerLeave((peerId) => {
            this.handlePeerLeave(peerId)
        })

        // Setup message channels
        const [sendMessage, getMessage] = this.room.makeAction('message')
        const [sendFile, getFile] = this.room.makeAction('file')
        const [sendPeerInfo, getPeerInfo] = this.room.makeAction('peerInfo')

        this.sendMessage = sendMessage
        this.sendFile = sendFile
        this.sendPeerInfo = sendPeerInfo

        // Handle incoming messages
        getMessage(async (data, peerId) => {
            try {
                const decrypted = await this.crypto.decryptMessage(data.content)
                this.emitEvent('message', {
                    peerId,
                    username: this.peers.get(peerId)?.username || 'Unknown',
                    text: decrypted,
                    timestamp: data.timestamp
                })
            } catch (err) {
                console.error('Failed to decrypt message:', err)
            }
        })

        // Handle incoming files
        getFile(async (data, peerId) => {
            try {
                const decrypted = await this.crypto.decryptFile(data.data)
                this.downloadFile(data.name, decrypted)
                this.emitEvent('message', {
                    peerId,
                    username: this.peers.get(peerId)?.username || 'Unknown',
                    text: `📎 Sent file: ${data.name}`,
                    timestamp: Date.now()
                })
            } catch (err) {
                console.error('Failed to decrypt file:', err)
            }
        })

        // Handle peer info exchange
        getPeerInfo((data, peerId) => {
            this.peers.set(peerId, { username: data.username })
            this.emitEvent('peerJoin', { peerId, username: data.username })
        })

        // Broadcast own info
        this.sendPeerInfo({ username: this.username })

        this.emitEvent('connectionStatus', 'connected')
    }

    handlePeerJoin(peerId) {
        // Will be handled after peer info exchange
    }

    handlePeerLeave(peerId) {
        const peer = this.peers.get(peerId)
        if (peer) {
            this.emitEvent('peerLeave', { peerId, username: peer.username })
            this.peers.delete(peerId)
        }
    }

    disconnect() {
        if (this.room) {
            this.room.leave()
            this.room = null
        }
        this.peers.clear()
        this.emitEvent('connectionStatus', 'disconnected')
    }

    downloadFile(filename, data) {
        const blob = new Blob([data])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)
    }

    onPeerJoin(handler) {
        this.handlers.peerJoin.push(handler)
    }

    onPeerLeave(handler) {
        this.handlers.peerLeave.push(handler)
    }

    onMessage(handler) {
        this.handlers.message.push(handler)
    }

    onConnectionStatus(handler) {
        this.handlers.connectionStatus.push(handler)
    }

    emitEvent(event, data) {
        this.handlers[event].forEach(handler => handler(data))
    }
}
