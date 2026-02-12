'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Terminal,
  Activity,
  Search,
  Plus,
  ChevronRight,
  Hexagon,
  Cpu,
  TrendingUp,
  MessageSquare,
  Shield,
  Wallet,
  Globe,
  Ghost
} from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { getAgents, type Agent } from '../lib/api'

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// --- CONSTANTS ---
const VIEW_TRANSITION = { duration: 0.7, ease: [0.32, 0.72, 0, 1] as const }

// --- COMPONENTS ---

// 1. UI PRIMITIVES
function Badge({ children, className, glow = false }: { children: React.ReactNode, className?: string, glow?: boolean }) {
  return (
    <div className={cn(
      "px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase border border-white/10 bg-white/5 text-white/70",
      glow && "border-purple-500/30 text-purple-400 bg-purple-500/10 shadow-[0_0_15px_-3px_rgba(124,58,237,0.3)]",
      className
    )}>
      {children}
    </div>
  )
}

function Card({ children, className, hover = true }: { children: React.ReactNode, className?: string, hover?: boolean }) {
  return (
    <div className={cn(
      "bg-[#0A0A0A] border border-white/[0.03] rounded-[32px] overflow-hidden backdrop-blur-sm",
      hover && "hover:border-purple-500/20 transition-colors duration-500",
      className
    )}>
      {children}
    </div>
  )
}

function Button({ children, variant = 'primary', className, onClick }: { children: React.ReactNode, variant?: 'primary' | 'ghost' | 'outline', className?: string, onClick?: () => void }) {
  const base = "h-12 px-6 rounded-[20px] font-medium transition-all duration-300 flex items-center gap-2 text-sm tracking-tight active:scale-95"
  const styles = {
    primary: "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]",
    ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/5",
    outline: "border border-white/10 text-white hover:border-white/30 hover:bg-white/5"
  }
  return (
    <button onClick={onClick} className={cn(base, styles[variant], className)}>
      {children}
    </button>
  )
}

// 2. SUB-VIEWS

// --- INCUBATOR (GENESIS) ---
function IncubatorView({ onComplete }: { onComplete: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const bootSequence = [
    "INITIALIZING_CORTEX_V2...",
    "ESTABLISHING_SECURE_HANDSHAKE...",
    "VERIFYING_TEE_INTEGRITY...",
    "LOADING_NEURAL_WEIGHTS [7B]...",
    "CONNECTING_TO_BNB_CHAIN...",
    "GENESIS_PULSE_DETECTED.",
    "OBSIDIAN_UPLINK_ESTABLISHED."
  ]

  useEffect(() => {
    let delay = 0
    bootSequence.forEach((line, index) => {
      delay += Math.random() * 500 + 300
      setTimeout(() => {
        setLines(prev => [...prev, line])
        if (index === bootSequence.length - 1) {
          setTimeout(onComplete, 1000)
        }
      }, delay)
    })
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
      className="fixed inset-0 z-50 bg-[#000000] flex items-center justify-center font-mono"
    >
      <div className="w-full max-w-2xl p-10">
        <div className="flex items-center gap-3 text-purple-500 mb-8 animate-pulse">
          <Hexagon className="w-6 h-6 fill-purple-500/20" />
          <span className="text-xs tracking-[0.2em]">OBSIDIAN_FORGE // BOOT</span>
        </div>
        <div className="space-y-2 text-sm md:text-base">
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <span className="text-white/20 select-none">{`0${i + 1}`}</span>
              <span className={cn(
                "text-white/80",
                i === lines.length - 1 && "text-purple-400"
              )}>
                {line}
              </span>
            </motion.div>
          ))}
          <motion.div
            animate={{ opacity: [0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-3 h-5 bg-purple-500 mt-2"
          />
        </div>
      </div>
    </motion.div>
  )
}

// --- AGENT CARD ---
function AgentCard({ agent, onClick }: { agent: Agent, onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="group cursor-pointer break-inside-avoid mb-6"
    >
      <Card className="relative p-6 min-h-[280px] flex flex-col justify-between hover:shadow-[0_0_40px_-10px_rgba(124,58,237,0.1)]">
        {/* Hover Ring */}
        <div className="absolute inset-0 border-2 border-purple-500/0 rounded-[32px] group-hover:border-purple-500/30 transition-colors duration-500" />

        {/* Header */}
        <div className="flex justify-between items-start z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-bold group-hover:bg-purple-600 group-hover:text-white transition-colors duration-500 shadow-inner border border-white/5">
            {agent.ticker[0]}
          </div>
          <Badge glow>{`GEN-${agent.id.slice(0, 4)}`}</Badge>
        </div>

        {/* Content */}
        <div className="z-10 mt-6 space-y-3">
          <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-purple-400 transition-colors">
            {agent.name}
          </h3>
          <p className="text-sm text-white/50 leading-relaxed font-light line-clamp-3">
            {agent.metadataURI.includes('{')
              ? JSON.parse(agent.metadataURI).description
              : "An autonomous agent operating within the Obsidian Forge lattice."}
          </p>
        </div>

        {/* Footer */}
        <div className="z-10 mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Market Cap</span>
            <span className="font-mono text-sm text-white/90">$0.00</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Bonding</span>
            <span className="font-mono text-sm text-purple-400">{agent.bondingProgress.toFixed(1)}%</span>
            <div className="w-16 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div style={{ width: `${agent.bondingProgress}%` }} className="h-full bg-purple-500 shadow-[0_0_10px_purple]" />
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// --- FEED VIEW ---
function FeedView({ agents, onSelect }: { agents: Agent[], onSelect: (a: Agent) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={VIEW_TRANSITION}
      className="pt-32 px-6 pb-20 w-full max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-4">
            Ghost Feed <span className="text-purple-600">.</span>
          </h1>
          <p className="text-lg text-white/40 max-w-xl font-light">
            Live stream of autonomous entities born from the Forge. Currently monitoring <span className="text-white font-mono">{agents.length}</span> active signals.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="SEARCH_SIGNAL..."
              className="w-64 h-12 pl-12 pr-4 bg-[#0A0A0A] border border-white/10 rounded-[20px] text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors font-mono placeholder:text-white/20"
            />
          </div>
          <Button variant="outline" className="h-12 w-12 p-0 justify-center">
            <Activity className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} onClick={() => onSelect(agent)} />
        ))}
      </div>
    </motion.div>
  )
}

// --- TRENCHES (DETAIL LAYOUT) ---
function TrenchesView({ agent, onBack }: { agent: Agent, onBack: () => void }) {
  if (!agent) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={VIEW_TRANSITION}
      className="h-screen w-full pt-20 px-6 pb-6 flex flex-col overflow-hidden"
    >
      {/* Top Nav */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="text-white/50">
          <ChevronRight className="w-4 h-4 rotate-180" /> Back
        </Button>
        <div className="h-8 w-[1px] bg-white/10" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold text-white">
            {agent.ticker[0]}
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">{agent.name}</h2>
          <Badge className="ml-2 font-mono text-purple-400 border-purple-500/20 bg-purple-500/5">
            ${agent.ticker}
          </Badge>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">

        {/* LEFT: THOUGHT STREAM */}
        <Card className="col-span-3 p-0 flex flex-col relative overflow-hidden group">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50 shadow-[0_0_20px_purple]" />
          <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
            <div className="flex items-center gap-2 text-white/70">
              <Cpu className="w-4 h-4" />
              <span className="text-xs font-bold tracking-widest uppercase">Cortex Stream</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_green]" />
          </div>
          <div className="flex-1 p-5 overflow-y-auto font-mono text-xs space-y-6 relative">
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black/50" />

            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative pl-4 border-l border-white/10">
                <div className="absolute -left-[3px] top-0 w-[5px] h-[5px] rounded-full bg-purple-500" />
                <div className="text-white/30 mb-1">{(new Date()).toLocaleTimeString()}</div>
                <div className="text-purple-300/90 leading-relaxed">
                  Analyzing market sentiment for ${agent.ticker}. Detected 45% variance in liquidity pools. Initiating rebalance protocol...
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* MIDDLE: CHART & BONDING */}
        <div className="col-span-6 flex flex-col gap-6">
          <Card className="flex-1 p-6 relative flex items-center justify-center border-white/5">
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <TrendingUp className="w-32 h-32 text-purple-500" />
            </div>
            <div className="text-center z-10">
              <h3 className="text-3xl font-bold text-white mb-2">Bonding Curve</h3>
              <p className="text-white/40">Market simulation visualization placeholder</p>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-6 h-48">
            <Card className="p-5 flex flex-col justify-between">
              <span className="text-xs uppercase tracking-widest text-white/40">Market Cap</span>
              <span className="text-3xl font-mono text-white">$142,042</span>
              <div className="text-green-400 text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12.4%
              </div>
            </Card>
            <Card className="p-5 flex flex-col justify-between border-purple-500/20 bg-purple-900/5">
              <span className="text-xs uppercase tracking-widest text-purple-300/60">Bonding Progress</span>
              <span className="text-3xl font-mono text-purple-400">{agent.bondingProgress}%</span>
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                <div style={{ width: `${agent.bondingProgress}%` }} className="h-full bg-purple-500" />
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT: GOVERNANCE */}
        <Card className="col-span-3 p-0 flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center gap-2 bg-white/[0.01]">
            <Shield className="w-4 h-4 text-white/70" />
            <span className="text-xs font-bold tracking-widest uppercase text-white/70">Governance</span>
          </div>
          <div className="flex-1 p-5 space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-colors cursor-pointer group">
              <div className="flex justify-between mb-3 text-xs">
                <span className="text-purple-400">Active Proposal</span>
                <span className="text-white/30">Ends in 4h</span>
              </div>
              <h4 className="text-white font-medium mb-2 group-hover:text-purple-300 transition-colors">Increase Twitter Activity</h4>
              <div className="w-full bg-black h-2 rounded-full overflow-hidden flex">
                <div className="w-[70%] bg-green-500" />
                <div className="w-[30%] bg-red-500" />
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-white/30 text-xs hover:border-white/20 hover:text-white/50 cursor-pointer transition-all">
              Create Proposal
            </div>
          </div>
        </Card>

      </div>
    </motion.div>
  )
}

// --- MAIN APP COMPONENT ---
export default function App() {
  const [view, setView] = useState<'feed' | 'incubator' | 'trenches'>('feed')
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  // Initial Load
  useEffect(() => {
    // Check if we need to show genesis
    const hasSeenGenesis = sessionStorage.getItem('genesis_seen')
    if (!hasSeenGenesis) {
      setView('incubator')
      sessionStorage.setItem('genesis_seen', 'true')
    }

    // Load agents
    getAgents().then(setAgents)
  }, [])

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent)
    setView('trenches')
  }

  return (
    <div className="bg-[#000000] min-h-screen text-white font-sans selection:bg-purple-500/30">
      {/* GLOBAL BACKGROUND EFFECTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-purple-900/20 rounded-full blur-[120px] opacity-20 animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[100px] opacity-20" />
      </div>

      {/* FLOATING NAVBAR */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center gap-8 shadow-2xl">
        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('feed')}>
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(124,58,237,0.5)] group-hover:scale-110 transition-transform">
            F
          </div>
          <span className="font-bold tracking-tight hidden md:block">Forge<span className="text-purple-500">.fun</span></span>
        </div>

        <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-9 px-3 rounded-full text-xs" onClick={() => setView('feed')}>
            <Ghost className="w-4 h-4" /> Feed
          </Button>
          <Button variant="ghost" className="h-9 px-3 rounded-full text-xs text-white/50">
            <Terminal className="w-4 h-4" /> Console
          </Button>
        </div>

        <div className="h-6 w-[1px] bg-white/10 hidden md:block" />

        <Button variant="primary" className="h-9 rounded-full px-5 text-xs bg-white hover:bg-white/90 text-black shadow-lg shadow-white/10">
          <Wallet className="w-4 h-4" /> Connect
        </Button>
      </nav>

      <AnimatePresence mode="wait">
        {view === 'incubator' && (
          <IncubatorView key="incubator" onComplete={() => setView('feed')} />
        )}
        {view === 'feed' && (
          <FeedView key="feed" agents={agents} onSelect={handleSelectAgent} />
        )}
        {view === 'trenches' && selectedAgent && (
          <TrenchesView key="trenches" agent={selectedAgent} onBack={() => setView('feed')} />
        )}
      </AnimatePresence>
    </div>
  )
}
