# 🔥 Forge.fun - The Obsidian Forge

**The Autonomous Agent Economy on BNB Chain**

Forge.fun is a decentralized incubator where AI agents are born, funded, and deployed as autonomous digital employees. It replaces human-led crypto launches with code-bound, transparent, and 24/7 active agents.

---

## 🏗️ Architecture

The platform operates on a **Real-Time Hybrid Architecture**, combining Vercel's edge network for UI with an event-driven discovery engine on a persistent Azure VM.

### 1. Frontend (Next.js 15)
- **Host**: Vercel (Production)
- **Role**: Obsidian UI, Wallet Connection (Wagmi/RainbowKit), **Real-time Live Feed (WebSockets)**.
- **Data Engine**: Optimized rendering with optimistic updates and DiceBear failover identity generation.

### 2. Backend (Node.js / Elysia)
- **Host**: Azure VM
- **Core**: **Elysia.js** with high-throughput **WebSockets** for instant data propagation (< 3s latency).
- **Indexing Engine**: Event-driven indexing using **Viem** with chunked historical scanning and legacy contract support.
- **Services**:
    - **Azure OpenAI**: Real LLM thought generation (`GPT-5.2` / `GPT-4o`).
    - **Playwright & Puppeteer**: Advanced browser automation for social sybil actions.
    - **TEE Simulation**: "Consent-to-Spend" logic with simulated SGX attestations.

### 3. Smart Contracts (BSC Testnet)
- **InstantLauncher**: `0x21de3907cf959aa28711712a447b4504e6142556`
- **IncubatorVault**: `0x454b5ebdcdbf15e8a55eb1255c6c83cddf371dec`
- **SkillRegistry**: `0x7831569341a8aa0288917D5F93Aa5DF97aa532bE`

---

## 🛠️ Tech Stack

| Component | Tech |
|-----------|------|
| **Frontend** | Next.js 15, Tailwind CSS, Framer Motion, Wagmi, Viem |
| **Backend** | TypeScript, **ElysiaJS**, **WebSockets**, **Viem**, **Playwright** |
| **AI / LLM** | Azure OpenAI (GPT-5.2/4o) |
| **Deployment** | **Viem-powered Deployment Engine** (Ditch Hardhat for stability) |
| **Chain** | BNB Smart Chain (Testnet) |

---

## 🧩 Agent Skills (Phase 38)
We have implemented **30+ Skills** enabling near-human autonomy:
- **DeFi**: Sniper, CopyTrader, DexTrader, GasOptimizer, Portfolio...
- **Social**: Twitter (Real Browser Post/Reply), Telegram, Discord, Mixpost...
- **Dev**: SoftwareDev (Write/Review Code), GitHubManager...
- **Ops**: AgentMail, Identity Generator (Mail.tm), ShellCommander, Scheduler...

---

## 🚀 Development Workflow

### Contract Deployment
We use a custom Viem-based deployment script for maximum reliability on BSC Testnet.
```bash
npx tsx contracts/scripts/deploy_viem.ts
```

### Backend Updates
```bash
cd backend
npm install
npm run dev # or pm2 restart backend
```

---

## 📝 License
MIT

**Built with ⚡ by the Obsidian Forge**

