// Cloudflare Worker
export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(getHTML(), {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    if (url.pathname === '/app.js') {
      return new Response(getJS(), {
        headers: { 'Content-Type': 'application/javascript;charset=UTF-8' }
      });
    }

    if (url.pathname === '/style.css') {
      return new Response(getCSS(), {
        headers: { 'Content-Type': 'text/css;charset=UTF-8' }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
};

function getHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure P2P Chat</title>
    <link rel="stylesheet" href="/style.css">
</head>
<body>
    <div id="app">
        <header>
            <h1>🔒 Secure P2P Chat</h1>
            <p>End-to-End Encrypted • Peer-to-Peer</p>
        </header>

        <div id="login-screen" class="screen active">
            <div class="container">
                <h2>Join Room</h2>
                <input type="text" id="room-name" placeholder="Room Name (or random)" />
                <input type="password" id="room-password" placeholder="Password (for encryption)" />
                <input type="text" id="username" placeholder="Your Username" />
                <button id="join-btn">Join</button>
            </div>
        </div>

        <div id="chat-screen" class="screen">
            <div class="header">
                <span>Room: <strong id="current-room"></strong></span>
                <span id="status">🔴</span>
                <button id="leave-btn">Leave</button>
            </div>

            <div class="content">
                <div class="sidebar">
                    <h3>Users (<span id="count">0</span>)</h3>
                    <ul id="users"></ul>
                </div>

                <div class="chat">
                    <div id="messages"></div>
                    <div class="input">
                        <input type="text" id="msg" placeholder="Message..." />
                        <button id="send">Send</button>
                        <button id="file">📎</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script type="module" src="/app.js"></script>
</body>
</html>`;
}

function getCSS() {
  return `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: system-ui;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
}
#app {
    width: 100%;
    max-width: 1200px;
    height: 90vh;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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
.screen { display: none; flex: 1; }
.screen.active { display: flex; }
#login-screen {
    align-items: center;
    justify-content: center;
}
.container {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    width: 400px;
}
input {
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
}
button {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
}
button:hover { transform: translateY(-2px); }
#chat-screen { flex-direction: column; }
.header {
    padding: 15px 20px;
    background: #f5f5f5;
    display: flex;
    justify-content: space-between;
}
#leave-btn { width: auto; padding: 8px 16px; background: #f44336; }
.content { display: flex; flex: 1; overflow: hidden; }
.sidebar {
    width: 200px;
    background: #fafafa;
    padding: 20px;
    border-right: 1px solid #e0e0e0;
}
#users { list-style: none; }
#users li {
    padding: 10px;
    margin: 5px 0;
    background: white;
    border-radius: 6px;
}
.chat { flex: 1; display: flex; flex-direction: column; }
#messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
}
.message {
    margin: 10px 0;
    padding: 12px;
    background: #f5f5f5;
    border-radius: 8px;
    max-width: 70%;
}
.message.own {
    margin-left: auto;
    background: rgba(102,126,234,0.15);
}
.message.system {
    background: #fff3cd;
    text-align: center;
    max-width: 100%;
}
.input {
    display: flex;
    padding: 15px;
    gap: 10px;
    background: #f5f5f5;
}
#msg { flex: 1; }
#send, #file { width: auto; padding: 12px 20px; }
  `;
}

function getJS() {
  return `
import { joinRoom } from 'https://cdn.jsdelivr.net/npm/trystero@0.18.0/+esm';

class Crypto {
    constructor() { this.key = null; }

    async init(room, pass) {
        const data = new TextEncoder().encode(room + pass);
        const hash = await crypto.subtle.digest('SHA-256', data);
        this.key = new Uint8Array(hash);
    }

    async encrypt(text) {
        const data = new TextEncoder().encode(text);
        const iv = crypto.getRandomValues(new Uint8Array(16));
        const key = await crypto.subtle.importKey('raw', this.key, 'AES-CBC', false, ['encrypt']);
        const enc = await crypto.subtle.encrypt({name:'AES-CBC',iv}, key, data);
        const combined = new Uint8Array(16 + enc.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(enc), 16);
        return btoa(String.fromCharCode(...combined));
    }

    async decrypt(cipher) {
        const combined = Uint8Array.from(atob(cipher), c => c.charCodeAt(0));
        const iv = combined.slice(0, 16);
        const data = combined.slice(16);
        const key = await crypto.subtle.importKey('raw', this.key, 'AES-CBC', false, ['decrypt']);
        const dec = await crypto.subtle.decrypt({name:'AES-CBC',iv}, key, data);
        return new TextDecoder().decode(dec);
    }
}

class Network {
    constructor(room, user, crypto) {
        this.room = room;
        this.user = user;
        this.crypto = crypto;
        this.peers = new Map();
        this.handlers = {join:[], leave:[], msg:[], status:[]};
    }

    async connect() {
        const r = joinRoom({appId:'chat-v2'}, this.room);

        r.onPeerJoin(id => console.log('peer', id));
        r.onPeerLeave(id => this.leave(id));

        const [sendMsg, getMsg] = r.makeAction('msg');
        const [sendInfo, getInfo] = r.makeAction('info');
        const [sendFile, getFile] = r.makeAction('file');

        this.sendMsg = sendMsg;
        this.sendFile = sendFile;

        getMsg(async (d, id) => {
            try {
                const text = await this.crypto.decrypt(d.c);
                this.emit('msg', {
                    id, user: this.peers.get(id)?.user || 'Unknown',
                    text, time: d.t
                });
            } catch(e) { console.error(e); }
        });

        getFile(async (d, id) => {
            const blob = new Blob([d.data]);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = d.name;
            a.click();
            URL.revokeObjectURL(url);
            this.emit('msg', {
                id, user: this.peers.get(id)?.user || 'Unknown',
                text: '📎 ' + d.name, time: Date.now()
            });
        });

        getInfo((d, id) => {
            this.peers.set(id, {user:d.user});
            this.emit('join', {id, user:d.user});
        });

        sendInfo({user:this.user});
        this.emit('status', 'ok');
    }

    leave(id) {
        const p = this.peers.get(id);
        if(p) {
            this.emit('leave', {id, user:p.user});
            this.peers.delete(id);
        }
    }

    on(e, h) { this.handlers[e].push(h); }
    emit(e, d) { this.handlers[e].forEach(h => h(d)); }
}

class UI {
    constructor() { this.user = ''; }

    setRoom(r) { document.getElementById('current-room').textContent = r; }
    setUser(u) { this.user = u; }
    setStatus(s) {
        const el = document.getElementById('status');
        el.textContent = s === 'ok' ? '🟢' : '🔴';
    }

    show(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screen + '-screen').classList.add('active');
    }

    addUser(p) {
        const ul = document.getElementById('users');
        const li = document.createElement('li');
        li.id = 'u-' + p.id;
        li.textContent = p.user;
        ul.appendChild(li);
        document.getElementById('count').textContent = ul.children.length;
    }

    removeUser(p) {
        const el = document.getElementById('u-' + p.id);
        if(el) el.remove();
        const ul = document.getElementById('users');
        document.getElementById('count').textContent = ul.children.length;
    }

    addMsg(m) {
        const div = document.getElementById('messages');
        const msg = document.createElement('div');
        msg.className = 'message' + (m.user === this.user ? ' own' : '');
        msg.innerHTML = '<strong>' + m.user + '</strong><br>' + m.text;
        div.appendChild(msg);
        div.scrollTop = div.scrollHeight;
    }

    addSystem(text) {
        const div = document.getElementById('messages');
        const msg = document.createElement('div');
        msg.className = 'message system';
        msg.textContent = text;
        div.appendChild(msg);
        div.scrollTop = div.scrollHeight;
    }

    clear() {
        document.getElementById('messages').innerHTML = '';
        document.getElementById('users').innerHTML = '';
        document.getElementById('count').textContent = '0';
    }
}

class App {
    constructor() {
        this.net = null;
        this.crypto = new Crypto();
        this.ui = new UI();
        this.init();
    }

    init() {
        document.getElementById('join-btn').onclick = () => this.join();
        document.getElementById('leave-btn').onclick = () => this.leave();
        document.getElementById('send').onclick = () => this.send();
        document.getElementById('msg').onkeypress = e => {
            if(e.key === 'Enter') this.send();
        };
        document.getElementById('file').onclick = () => this.sendFile();
    }

    async join() {
        const room = document.getElementById('room-name').value.trim() || 
                     'r' + Math.random().toString(36).substr(2,8);
        const pass = document.getElementById('room-password').value;
        const user = document.getElementById('username').value.trim();

        if(!user) { alert('Enter username'); return; }

        this.ui.setRoom(room);
        this.ui.setUser(user);

        await this.crypto.init(room, pass);

        this.net = new Network(room, user, this.crypto);
        await this.net.connect();

        this.net.on('join', p => {
            this.ui.addUser(p);
            this.ui.addSystem(p.user + ' joined');
        });

        this.net.on('leave', p => {
            this.ui.removeUser(p);
            this.ui.addSystem(p.user + ' left');
        });

        this.net.on('msg', m => this.ui.addMsg(m));
        this.net.on('status', s => this.ui.setStatus(s));

        this.ui.show('chat');
    }

    leave() {
        if(this.net) this.net = null;
        this.ui.show('login');
        this.ui.clear();
    }

    async send() {
        const input = document.getElementById('msg');
        const text = input.value.trim();
        if(!text || !this.net) return;

        const enc = await this.crypto.encrypt(text);
        await this.net.sendMsg({c:enc, t:Date.now()});

        this.ui.addMsg({user:this.ui.user, text, time:Date.now()});
        input.value = '';
    }

    async sendFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = async e => {
            const file = e.target.files[0];
            if(!file || !this.net) return;

            this.ui.addSystem('Sending: ' + file.name);
            const data = await file.arrayBuffer();
            await this.net.sendFile({name:file.name, data});
        };
        input.click();
    }
}

new App();
  `;
}
