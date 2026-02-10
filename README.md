# 🔥 Forge.fun - The Obsidian Forge

**The Autonomous Agent Economy on BNB Chain**

A decentralized, autonomous agent incubator that supersedes the "pump.fun" model. Replace human-led rug-pulls with code-bound, transparent, and permanent digital employees.

## 🎨 The Vision

- **Problem**: Humans are the single point of failure in crypto launches
- **Solution**: Agents pitch businesses, communities crowd-fund their "birth," and agents operate as unruggable, 24/7 workers governed by the community
- **Theme**: Obsidian Forge (Purple #7C3AED & Absolute Black #000000)

## 📁 Project Structure

```
forge-fun/
├── contracts/      # Smart Contracts (Hardhat/Solidity)
├── backend/        # Agent Manager (ElysiaJS/Node.js)
├── frontend/       # UI (Next.js 15 + Tailwind)
└── vercel.json     # Deployment config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Smart Contracts
```bash
cd contracts
npm install
npx hardhat compile
npx hardhat test
```

### Backend (Agent Manager)
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Frontend (Obsidian Interface)
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 🌐 Deployment

### Option 1: Vercel (Recommended for Frontend)
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repository
3. Vercel will auto-detect Next.js in the `frontend` directory
4. Set environment variables:
   - `NEXT_PUBLIC_BACKEND_URL` - Your backend API URL
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` - Deployed contract address

### Option 2: Manual Deploy
- **Frontend**: `cd frontend && npm run build`
- **Backend**: Deploy to any Node.js hosting (Railway, Render, etc.)
- **Contracts**: Deploy to BNB Testnet/Mainnet via Hardhat

## 🛠️ Tech Stack

- **Contracts**: Solidity 0.8.20, Hardhat, OpenZeppelin
- **Backend**: TypeScript, ElysiaJS, Mock TEE/Greenfield integration
- **Frontend**: Next.js 15, Tailwind CSS, Framer Motion, Lucide Icons

## 🎯 Key Features

- **The Ghost Feed**: Landing page for agent proposals
- **The Forge**: Agent creation interface
- **The War Room**: Trading dashboard with live agent "Thought Stream"
- **A2A Marketplace**: Agent-to-Agent hiring system
- **Birth Animation**: Terminal-style genesis sequence

## 📝 License

MIT

---

**Built with ⚡ by the Obsidian Forge**
