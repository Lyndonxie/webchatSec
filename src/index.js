// Cloudflare Worker - 完整的聊天应用
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 主页 - 返回完整的 HTML 应用
    if (url.pathname === '/') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // 返回 404
    return new Response('Not Found', { status: 404 });
  }
};

// 完整的 HTML 应用（包含 CSS 和 JS）
function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🔒 Secure P2P Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        #app {
            width: 100%;
            max-width: 1200px;
            height: 90vh;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }

        header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }

        header h1 {
            margin-bottom: 5px;
            font-size: 24px;
        }

        header p {
            opacity: 0.9;
            font-size: 14px;
        }

        .screen {
            display: none;
            flex: 1;
        }

        .screen.active {
            display: flex;
        }

        /* Login Screen */
        #login-screen {
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }

        .login-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 400px;
        }

        .login-container h2 {
            margin-bottom: 20px;
            color: #333;
        }

        .login-container input {
            width: 100%;
            padding: 12px;
            margin-bottom: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
        }

        .login-container input:focus {
            outline: none;
            border-color: #667eea;
        }

        .login-container button {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }

        .login-container button:hover {
            opacity: 0.9;
        }

        /* Chat Screen */
        #chat-screen {
            flex-direction: column;
        }

        .chat-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background: #f5f5f5;
            border-bottom: 1px solid #e0e0e0;
            flex-wrap: wrap;
            gap: 10px;
        }

        #room-info {
            font-size: 14px;
            color: #666;
        }

        #connection-status {
            font-size: 14px;
            font-weight: 600;
        }

        #leave-btn {
            padding: 8px 16px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }

        .chat-container {
            display: flex;
            flex: 1;
            overflow: hidden;
        }

        .sidebar {
            width: 250px;
            background: #fafafa;
            border-right: 1px solid #e0e0e0;
            padding: 20px;
            overflow-y: auto;
        }

        .sidebar h3 {
            font-size: 16px;
            color: #333;
            margin-bottom: 15px;
        }

        #user-list {
            list-style: none;
        }

        #user-list li {
            padding: 10px;
            margin-bottom: 5px;
            background: white;
            border-radius: 6px;
            font-size: 14px;
        }

        .main-chat {
            flex: 1;
            display: flex;
            flex-direction: column;
        }

        #messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: white;
        }

        .message {
            margin-bottom: 15px;
            padding: 12px;
            background: #f5f5f5;
            border-radius: 8px;
            max-width: 70%;
        }

        .message.own-message {
            margin-left: auto;
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
        }

        .message.system-message {
            background: #fff3cd;
            color: #856404;
            text-align: center;
            max-width: 100%;
            font-size: 13px;
        }

        .message-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
            font-size: 14px;
        }

        .message-header strong {
            color: #667eea;
        }

        .message-header .own-username {
            color: #764ba2;
        }

        .timestamp {
            font-size: 12px;
            color: #999;
        }

        .message-content {
            color: #333;
            word-wrap: break-word;
        }

        .input-area {
            display: flex;
            padding: 15px 20px;
            background: #f5f5f5;
            border-top: 1px solid #e0e0e0;
            gap: 10px;
        }

        #message-input {
            flex: 1;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
        }

        #send-btn, #send-file-btn {
            padding: 12px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
        }

        @media (max-width: 768px) {
            .sidebar {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div id="app">
        <header>
            <h1>🔒 Secure P2P Chat</h1>
            <p>Chitchatter + NodeCrypt on Cloudflare Workers</p>
        </header>

        <div id="login-screen" class="screen active">
            <div class="login-container">
                <h2>Join a Room</h2>
                <input type="text" id="room-name" placeholder="Room Name (leave blank for random)" />
                <input type="password" id="room-password" placeholder="Room Password (optional)" />
                <input type="text" id="username" placeholder="Your Username" required />
                <button id="join-btn">Join Room</button>
            </div>
        </div>

        <div id="chat-screen" class="screen">
            <div class="chat-header">
                <span id="room-info">Room: <strong id="current-room"></strong></span>
                <span id="connection-status">🔴 Connecting...</span>
                <button id="leave-btn">Leave Room</button>
            </div>

            <div class="chat-container">
                <div class="sidebar">
                    <h3>Online (<span id="user-count">0</span>)</h3>
                    <ul id="user-list"></ul>
                </div>

                <div class="main-chat">
                    <div id="messages"></div>
                    <div class="input-area">
                        <input type="text" id="message-input" placeholder="Type message..." />
                        <button id="send-btn">Send</button>
                        <button id="send-file-btn">📎</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script type="module">
        // Import Trystero from CDN
        import { joinRoom } from 'https://cdn.jsdelivr.net/npm/trystero@0.18.0/+esm';

        // Crypto Manager
        class CryptoManager {
            constructor() {
                this.roomKey = null;
            }

            async deriveRoomKey(roomName, password = '') {
                const combined = roomName + password;
                const encoder = new TextEncoder();
                const data = encoder.encode(combined);
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                this.roomKey = new Uint8Array(hashBuffer);
            }

            async encryptMessage(text) {
                const encoder = new TextEncoder();
                const data = encoder.encode(text);
                const iv = crypto.getRandomValues(new Uint8Array(12));

                const key = await crypto.subtle.importKey(
                    'raw',
                    this.roomKey,
                    'AES-GCM',
                    false,
                    ['encrypt']
                );

                const encrypted = await crypto.subtle.encrypt(
                    { name: 'AES-GCM', iv },
                    key,
                    data
                );

                const combined = new Uint8Array(iv.length + encrypted.byteLength);
                combined.set(iv);
                combined.set(new Uint8Array(encrypted), iv.length);

                return btoa(String.fromCharCode(...combined));
            }

            async decryptMessage(ciphertext) {
                const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
                const iv = combined.slice(0, 12);
                const data = combined.slice(12);

                const key = await crypto.subtle.importKey(
                    'raw',
                    this.roomKey,
                    'AES-GCM',
                    false,
                    ['decrypt']
                );

                const decrypted = await crypto.subtle.decrypt(
                    { name: 'AES-GCM', iv },
                    key,
                    data
                );

                const decoder = new TextDecoder();
                return decoder.decode(decrypted);
            }
        }

        // P2P Network
        class P2PNetwork {
            constructor(roomName, username, crypto) {
                this.roomName = roomName;
                this.username = username;
                this.crypto = crypto;
                this.room = null;
                this.peers = new Map();
                this.handlers = {};
            }

            async connect() {
                this.room = joinRoom({ appId: 'chitchatter-nodecrypt-v1' }, this.roomName);

                this.room.onPeerJoin(peerId => {
                    console.log('Peer joined:', peerId);
                });

                this.room.onPeerLeave(peerId => {
                    const peer = this.peers.get(peerId);
                    if (peer) {
                        this.emit('peerLeave', { peerId, username: peer.username });
                        this.peers.delete(peerId);
                    }
                });

                const [sendMsg, getMsg] = this.room.makeAction('message');
                const [sendInfo, getInfo] = this.room.makeAction('info');

                this.sendMessage = sendMsg;

                getMsg(async (data, peerId) => {
                    try {
                        const text = await this.crypto.decryptMessage(data.content);
                        this.emit('message', {
                            peerId,
                            username: this.peers.get(peerId)?.username || 'Unknown',
                            text,
                            timestamp: data.timestamp
                        });
                    } catch (e) {
                        console.error('Decrypt error:', e);
                    }
                });

                getInfo((data, peerId) => {
                    this.peers.set(peerId, { username: data.username });
                    this.emit('peerJoin', { peerId, username: data.username });
                });

                sendInfo({ username: this.username });
                this.emit('status', 'connected');
            }

            disconnect() {
                if (this.room) {
                    this.room.leave();
                    this.room = null;
                }
                this.peers.clear();
            }

            on(event, handler) {
                if (!this.handlers[event]) this.handlers[event] = [];
                this.handlers[event].push(handler);
            }

            emit(event, data) {
                if (this.handlers[event]) {
                    this.handlers[event].forEach(h => h(data));
                }
            }
        }

        // UI Controller
        class UI {
            constructor() {
                this.currentUsername = '';
            }

            setRoom(name) {
                document.getElementById('current-room').textContent = name;
            }

            setUsername(name) {
                this.currentUsername = name;
            }

            setStatus(status) {
                const el = document.getElementById('connection-status');
                if (status === 'connected') {
                    el.textContent = '🟢 Connected';
                    el.style.color = '#4caf50';
                } else {
                    el.textContent = '🔴 Disconnected';
                    el.style.color = '#f44336';
                }
            }

            showChat() {
                document.getElementById('login-screen').classList.remove('active');
                document.getElementById('chat-screen').classList.add('active');
            }

            showLogin() {
                document.getElementById('chat-screen').classList.remove('active');
                document.getElementById('login-screen').classList.add('active');
            }

            addUser(peer) {
                const list = document.getElementById('user-list');
                const li = document.createElement('li');
                li.id = 'user-' + peer.peerId;
                li.textContent = peer.username;
                list.appendChild(li);
                this.updateUserCount();
            }

            removeUser(peer) {
                const el = document.getElementById('user-' + peer.peerId);
                if (el) {
                    el.remove();
                    this.updateUserCount();
                }
            }

            updateUserCount() {
                const count = document.getElementById('user-list').children.length;
                document.getElementById('user-count').textContent = count;
            }

            addMessage(msg) {
                const div = document.getElementById('messages');
                const el = document.createElement('div');
                el.className = 'message';

                const time = new Date(msg.timestamp).toLocaleTimeString();
                const isOwn = msg.username === this.currentUsername;

                el.innerHTML = \`
                    <div class="message-header">
                        <strong class="\${isOwn ? 'own-username' : ''}">\${this.escape(msg.username)}</strong>
                        <span class="timestamp">\${time}</span>
                    </div>
                    <div class="message-content">\${this.escape(msg.text)}</div>
                \`;

                if (isOwn) el.classList.add('own-message');

                div.appendChild(el);
                div.scrollTop = div.scrollHeight;
            }

            addSystemMsg(text) {
                const div = document.getElementById('messages');
                const el = document.createElement('div');
                el.className = 'message system-message';
                el.textContent = text;
                div.appendChild(el);
                div.scrollTop = div.scrollHeight;
            }

            clear() {
                document.getElementById('messages').innerHTML = '';
                document.getElementById('user-list').innerHTML = '';
                this.updateUserCount();
            }

            escape(text) {
                const div = document.createElement('div');
                div.textContent = text;
                return div.innerHTML;
            }
        }

        // Main App
        class App {
            constructor() {
                this.network = null;
                this.crypto = new CryptoManager();
                this.ui = new UI();
                this.init();
            }

            init() {
                document.getElementById('join-btn').onclick = () => this.join();
                document.getElementById('leave-btn').onclick = () => this.leave();
                document.getElementById('send-btn').onclick = () => this.send();
                document.getElementById('message-input').onkeypress = (e) => {
                    if (e.key === 'Enter') this.send();
                };
            }

            async join() {
                const room = document.getElementById('room-name').value.trim() || 
                    'room-' + Math.random().toString(36).substr(2, 9);
                const password = document.getElementById('room-password').value;
                const username = document.getElementById('username').value.trim();

                if (!username) {
                    alert('Please enter a username');
                    return;
                }

                this.ui.setRoom(room);
                this.ui.setUsername(username);

                await this.crypto.deriveRoomKey(room, password);

                this.network = new P2PNetwork(room, username, this.crypto);

                this.network.on('peerJoin', peer => {
                    this.ui.addUser(peer);
                    this.ui.addSystemMsg(\`\${peer.username} joined\`);
                });

                this.network.on('peerLeave', peer => {
                    this.ui.removeUser(peer);
                    this.ui.addSystemMsg(\`\${peer.username} left\`);
                });

                this.network.on('message', msg => {
                    this.ui.addMessage(msg);
                });

                this.network.on('status', status => {
                    this.ui.setStatus(status);
                });

                await this.network.connect();
                this.ui.showChat();
            }

            leave() {
                if (this.network) {
                    this.network.disconnect();
                    this.network = null;
                }
                this.ui.showLogin();
                this.ui.clear();
            }

            async send() {
                const input = document.getElementById('message-input');
                const text = input.value.trim();

                if (!text || !this.network) return;

                const encrypted = await this.crypto.encryptMessage(text);
                this.network.sendMessage({
                    content: encrypted,
                    timestamp: Date.now()
                });

                this.ui.addMessage({
                    username: this.ui.currentUsername,
                    text,
                    timestamp: Date.now()
                });

                input.value = '';
            }
        }

        // Start app
        new App();
    </script>
</body>
</html>`;
}
