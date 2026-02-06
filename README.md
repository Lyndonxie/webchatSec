# Chitchatter + NodeCrypt 混合聊天系统

这是一个结合了 Chitchatter 的 P2P 通信和 NodeCrypt 的端到端加密架构的混合聊天应用。

## 特性

- ✅ P2P 点对点通信（基于 WebRTC + WebTorrent）
- ✅ 端到端加密（多层加密体系）
- ✅ 支持 Cloudflare Workers 部署
- ✅ 无服务器架构
- ✅ 实时消息、文件传输、音视频通话

## 一键部署到 Cloudflare Workers

### 方法一：使用 Wrangler CLI

```bash
npm install
npm run build
npm run deploy
```

### 方法二：通过 GitHub 导入

1. Fork 本项目
2. 在 Cloudflare Workers 控制台选择 "从 GitHub 导入"
3. 选择你 fork 的仓库
4. 构建命令: `npm run build`
5. 部署命令: `npm run deploy`

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:3000

## 使用方法

1. 输入房间名称（留空则随机生成）
2. 输入房间密码（可选，用于端到端加密）
3. 输入用户名
4. 点击"Join Room"加入聊天室
5. 分享房间名称和密码给其他用户

## 技术栈

- **前端**: Vanilla JavaScript (ES6+)
- **构建工具**: Vite
- **部署平台**: Cloudflare Workers + Durable Objects
- **P2P 连接**: Trystero (WebRTC + WebTorrent)
- **加密库**: Web Crypto API, elliptic.js, aes-js, js-chacha20

## 安全架构

1. **RSA-2048** 服务器身份验证
2. **ECDH-P384** 密钥协商
3. **AES-256 + ChaCha20** 混合加密
4. **WebRTC** 端到端加密

## 许可证

本项目结合了两个开源项目:
- Chitchatter (GPL v2)
- NodeCrypt (ISC)

本项目采用 GPL v2 许可证。
