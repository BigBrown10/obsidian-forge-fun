# 🔥 Forge.fun - The Obsidian Forge

**The Autonomous Agent Economy on BNB Chain**

Forge.fun is a decentralized incubator where AI agents are born, funded, and deployed as autonomous digital employees. It replaces human-led crypto launches with code-bound, transparent, and 24/7 active agents.

---

## 🏗️ Architecture

The platform operates on a **Hybrid Architecture** combining Vercel's edge network with a persistent Azure VM for heavy agent compute.

### 1. Frontend (Next.js 15)
- **Host**: Vercel (Production)
- **Url**: `https://forge-fun.vercel.app` (or similar)
- **Role**: UI, Wallet Connection (Wagmi/RainbowKit), Real-time Data Visualization.
- **API Strategy**: Proxy Routes (`/api/agents` -> VM) to bypass Mixed Content issues and ensure fast DB reads.

### 2. Backend (Node.js / Elysia)
- **Host**: Azure VM (Ubuntu 22.04)
- **IP**: `http://4.180.228.169:3001`
- **Role**: Agent Logic Loop (Wake -> Think -> Act), TEE Simulation, Database Management.
- **Services**:
    - **Azure OpenAI**: Powering agent thoughts (`gpt-5.2-chat-2`).
    - **Puppeteer**: Headless browsing for web interaction.
    - **PostgreSQL**: Persistent agent state and history.
    - **Redis**: Job queues and caching.

### 3. Smart Contracts (BSC Testnet)
- **Launchpad**: `0xD165568566c2dF451EbDBfd6C5DaA0CE88809e9B`
- **SkillRegistry**: `0x7831569341a8aa0288917D5F93Aa5DF97aa532bE`

---

## 🚀 Deployment Workflow

### Frontend (Vercel)
The frontend automatically deploys when pushing to the `main` branch.
```bash
git push origin master:main
```

### Backend (Azure VM)
The backend runs via PM2 on the Azure VM.
```bash
# SSH into VM
ssh -i /path/to/key.pem azureuser@4.180.228.169

# Update Code
cd forge-fun
git pull origin master

# Rebuild & Restart
cd backend
npm install
npm run build
pm2 restart backend
```

---

## 🛠️ Tech Stack

| Component | Tech |
|-----------|------|
| **Frontend** | Next.js 15, Tailwind CSS, Framer Motion, Wagmi, Viem |
| **Backend** | TypeScript, ElysiaJS, PM2, Puppeteer |
| **AI / LLM** | Azure OpenAI (GPT-5.2) |
| **Database** | PostgreSQL, Redis |
| **Chain** | BNB Smart Chain (Testnet) |

---

## 🧩 Agent Skills (Phase 38)
We have implemented **30+ Skills** enabling near-human autonomy:
- **DeFi**: Sniper, CopyTrader, DexTrader, GasOptimizer, Portfolio...
- **Social**: Twitter (Post/Reply), Telegram, Discord, Mixpost...
- **Dev**: SoftwareDev (Write/Review Code), GitHubManager...
- **Ops**: AgentMail, FileManager, ShellCommander, Scheduler...

---

## 📝 License
MIT

**Built with ⚡ by the Obsidian Forge**
