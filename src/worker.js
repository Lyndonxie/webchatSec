// Cloudflare Worker for WebSocket relay
export default {
    async fetch(request, env) {
        const url = new URL(request.url)

        // Serve static files
        if (url.pathname === '/' || url.pathname.startsWith('/src/') || url.pathname.startsWith('/assets/')) {
            return env.ASSETS.fetch(request)
        }

        // WebSocket upgrade for signaling
        if (request.headers.get('Upgrade') === 'websocket') {
            return handleWebSocket(request, env)
        }

        return new Response('Not Found', { status: 404 })
    }
}

async function handleWebSocket(request, env) {
    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)

    server.accept()

    server.addEventListener('message', event => {
        // Relay messages between peers (simple signaling)
        server.send(event.data)
    })

    return new Response(null, {
        status: 101,
        webSocket: client
    })
}

// Durable Object for chat rooms
export class ChatRoom {
    constructor(state, env) {
        this.state = state
        this.sessions = []
    }

    async fetch(request) {
        if (request.headers.get('Upgrade') !== 'websocket') {
            return new Response('Expected WebSocket', { status: 400 })
        }

        const pair = new WebSocketPair()
        const [client, server] = Object.values(pair)

        await this.handleSession(server)

        return new Response(null, {
            status: 101,
            webSocket: client
        })
    }

    async handleSession(webSocket) {
        webSocket.accept()
        this.sessions.push(webSocket)

        webSocket.addEventListener('message', event => {
            this.broadcast(event.data, webSocket)
        })

        webSocket.addEventListener('close', () => {
            this.sessions = this.sessions.filter(s => s !== webSocket)
        })
    }

    broadcast(message, sender) {
        for (const session of this.sessions) {
            if (session !== sender) {
                try {
                    session.send(message)
                } catch (err) {
                    // Remove closed sessions
                    this.sessions = this.sessions.filter(s => s !== session)
                }
            }
        }
    }
}
