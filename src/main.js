import { P2PNetwork } from './p2p/network.js'
import { CryptoManager } from './crypto/manager.js'
import { UIController } from './ui/controller.js'

class App {
    constructor() {
        this.network = null
        this.crypto = new CryptoManager()
        this.ui = new UIController()
        this.currentRoom = null

        this.init()
    }

    async init() {
        this.setupEventListeners()
        await this.crypto.init()
    }

    setupEventListeners() {
        document.getElementById('join-btn').addEventListener('click', () => this.joinRoom())
        document.getElementById('leave-btn').addEventListener('click', () => this.leaveRoom())
        document.getElementById('send-btn').addEventListener('click', () => this.sendMessage())
        document.getElementById('message-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage()
        })
        document.getElementById('send-file-btn').addEventListener('click', () => this.sendFile())
    }

    async joinRoom() {
        const roomName = document.getElementById('room-name').value.trim() || this.generateRoomId()
        const password = document.getElementById('room-password').value
        const username = document.getElementById('username').value.trim() || 'Anonymous'

        if (!username) {
            alert('Please enter a username')
            return
        }

        this.currentRoom = roomName
        this.ui.setRoom(roomName)
        this.ui.setUsername(username)

        // Initialize encryption with room password
        await this.crypto.deriveRoomKey(roomName, password)

        // Connect to P2P network
        this.network = new P2PNetwork(roomName, username, this.crypto)
        await this.network.connect()

        // Setup network event handlers
        this.network.onPeerJoin((peer) => {
            this.ui.addUser(peer)
            this.ui.addSystemMessage(`${peer.username} joined the room`)
        })

        this.network.onPeerLeave((peer) => {
            this.ui.removeUser(peer)
            this.ui.addSystemMessage(`${peer.username} left the room`)
        })

        this.network.onMessage((message) => {
            this.ui.addMessage(message)
        })

        this.network.onConnectionStatus((status) => {
            this.ui.setConnectionStatus(status)
        })

        this.ui.showChatScreen()
    }

    leaveRoom() {
        if (this.network) {
            this.network.disconnect()
            this.network = null
        }
        this.currentRoom = null
        this.ui.showLoginScreen()
        this.ui.clearMessages()
        this.ui.clearUsers()
    }

    async sendMessage() {
        const input = document.getElementById('message-input')
        const text = input.value.trim()

        if (!text || !this.network) return

        const encryptedMessage = await this.crypto.encryptMessage(text)
        await this.network.sendMessage({
            type: 'text',
            content: encryptedMessage,
            timestamp: Date.now()
        })

        // Display own message
        this.ui.addMessage({
            username: this.ui.currentUsername,
            text: text,
            timestamp: Date.now()
        })

        input.value = ''
    }

    async sendFile() {
        const input = document.createElement('input')
        input.type = 'file'
        input.onchange = async (e) => {
            const file = e.target.files[0]
            if (!file || !this.network) return

            this.ui.addSystemMessage(`Sending file: ${file.name}...`)

            const arrayBuffer = await file.arrayBuffer()
            const encryptedData = await this.crypto.encryptFile(arrayBuffer)

            await this.network.sendFile({
                name: file.name,
                size: file.size,
                type: file.type,
                data: encryptedData
            })
        }
        input.click()
    }

    generateRoomId() {
        return 'room-' + Math.random().toString(36).substr(2, 9)
    }
}

// Start the app
new App()
