# Chitchatter + NodeCrypt - Cloudflare Workers 版本

纯 Cloudflare Workers 部署的 P2P 加密聊天系统。

## 快速部署

```bash
npm install
npm run deploy
```

部署完成后，访问你的 Worker URL（例如：https://your-worker.your-subdomain.workers.dev）

## 本地开发

```bash
npm install
npm run dev
```

访问 http://localhost:8787

## 特性

- ✅ 纯 Cloudflare Workers 部署
- ✅ P2P WebRTC 通信
- ✅ AES-256 端到端加密
- ✅ 无需额外配置
- ✅ 一键部署

## 技术栈

- Cloudflare Workers
- WebRTC (P2P)
- Trystero
- AES-256-CBC 加密
