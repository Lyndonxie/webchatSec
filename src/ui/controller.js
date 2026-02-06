export class UIController {
    constructor() {
        this.currentUsername = ''
    }

    setRoom(roomName) {
        document.getElementById('current-room').textContent = roomName
    }

    setUsername(username) {
        this.currentUsername = username
    }

    setConnectionStatus(status) {
        const statusEl = document.getElementById('connection-status')
        if (status === 'connected') {
            statusEl.textContent = '🟢 Connected'
            statusEl.style.color = '#4caf50'
        } else {
            statusEl.textContent = '🔴 Disconnected'
            statusEl.style.color = '#f44336'
        }
    }

    showChatScreen() {
        document.getElementById('login-screen').classList.remove('active')
        document.getElementById('chat-screen').classList.add('active')
    }

    showLoginScreen() {
        document.getElementById('chat-screen').classList.remove('active')
        document.getElementById('login-screen').classList.add('active')
    }

    addUser(peer) {
        const userList = document.getElementById('user-list')
        const li = document.createElement('li')
        li.id = `user-${peer.peerId}`
        li.textContent = peer.username
        userList.appendChild(li)
        this.updateUserCount()
    }

    removeUser(peer) {
        const userEl = document.getElementById(`user-${peer.peerId}`)
        if (userEl) {
            userEl.remove()
            this.updateUserCount()
        }
    }

    clearUsers() {
        document.getElementById('user-list').innerHTML = ''
        this.updateUserCount()
    }

    updateUserCount() {
        const count = document.getElementById('user-list').children.length
        document.getElementById('user-count').textContent = count
    }

    addMessage(message) {
        const messagesDiv = document.getElementById('messages')
        const messageEl = document.createElement('div')
        messageEl.className = 'message'

        const time = new Date(message.timestamp).toLocaleTimeString()
        const isOwn = message.username === this.currentUsername

        messageEl.innerHTML = `
            <div class="message-header">
                <strong class="${isOwn ? 'own-username' : ''}">${this.escapeHtml(message.username)}</strong>
                <span class="timestamp">${time}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.text)}</div>
        `

        if (isOwn) {
            messageEl.classList.add('own-message')
        }

        messagesDiv.appendChild(messageEl)
        messagesDiv.scrollTop = messagesDiv.scrollHeight
    }

    addSystemMessage(text) {
        const messagesDiv = document.getElementById('messages')
        const messageEl = document.createElement('div')
        messageEl.className = 'message system-message'
        messageEl.textContent = text
        messagesDiv.appendChild(messageEl)
        messagesDiv.scrollTop = messagesDiv.scrollHeight
    }

    clearMessages() {
        document.getElementById('messages').innerHTML = ''
    }

    escapeHtml(text) {
        const div = document.createElement('div')
        div.textContent = text
        return div.innerHTML
    }
}
