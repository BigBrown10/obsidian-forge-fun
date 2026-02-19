'use client'

export const dynamic = 'force-dynamic'

import React, { useState } from 'react'
import { Search, Activity, Zap, Terminal, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAgents, type Agent } from '../hooks/useAgents'
import TokenCard from '../components/TokenCard'
import TokenRow from '../components/TokenRow'
import { AnimatePresence, motion } from 'framer-motion'

// Mock Data for "Neural Pulse" to show activity immediately
const MOCK_ACTIVITY = [
  { id: 1, action: 'DEPLOYED', agent: 'AutoGladius', time: '2s ago', type: 'success' },
  { id: 2, action: 'LIQUIDITY ADDED', agent: 'DeepSeeker', time: '15s ago', type: 'info' },
  { id: 3, action: 'PUMP', agent: 'BasedAI', time: '45s ago', type: 'success' },
  { id: 4, action: 'RUG PULLED', agent: 'ScamBot3000', time: '1m ago', type: 'error' },
]

export default function Dashboard() {
  const { data: agents, isLoading, error } = useAgents()
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSelectAgent = (agent: Agent) => {
    router.push(`/agent/${agent.ticker}`)
  }

  // Filter agents based on search
  const filteredAgents = (agents || []).filter(a => {
    // Basic search
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase()) && !a.ticker.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    return true
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())


  return (
    <div className="min-h-screen text-text-primary p-6 space-y-8">

      {/* Header Area (Search + Actions) */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Terminal className="w-8 h-8 text-accent" />
            THE TRENCHES
          </h1>
          <p className="text-text-dim text-sm mt-1">Live Token Feed & Autonomous Agent Global Activity</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-text-dim group-focus-within:text-accent transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search agents by name or ticker..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-white/10 rounded-xl leading-5 bg-white/5 text-text-primary placeholder-text-dim focus:outline-none focus:bg-white/10 focus:border-accent/50 focus:ring-1 focus:ring-accent/50 sm:text-sm transition-all"
            />
          </div>
        </div>
      </div>

      {/* Neural Pulse: A compact row showing recent agent actions */}
      <section className="border-t border-b border-white/5 py-4 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-base to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-base to-transparent z-10" />

        <div className="flex items-center gap-2 mb-2 px-2">
          <Activity className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-xs font-bold text-accent uppercase tracking-widest">Neural Pulse</span>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar px-2 mask-image-linear-to-r">
          {MOCK_ACTIVITY.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 whitespace-nowrap min-w-max">
              <div className={`w-1.5 h-1.5 rounded-full ${activity.type === 'success' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' :
                activity.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                  'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                }`} />
              <span className="text-xs font-mono text-text-dim">{activity.time}</span>
              <span className="text-xs font-bold text-white">{activity.agent}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 border border-white/5 ${activity.type === 'success' ? 'text-green-400 border-green-500/20' :
                activity.type === 'error' ? 'text-red-400 border-red-500/20' :
                  'text-blue-400 border-blue-500/20'
                }`}>
                {activity.action}
              </span>
            </div>
          ))}
          {/* Duplicate for visual fullness if needed, or implement infinite scroll later */}
        </div>
      </section>

      {/* The Grid: Live Tokens Hero Component */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500' : 'bg-success'} animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]`} />
            <h2 className="text-xl font-bold text-white">Live Agents</h2>
            <span className="bg-white/10 text-white text-xs px-2 py-0.5 rounded-full">{isLoading ? 'Syncing...' : `${filteredAgents.length} Active`}</span>
          </div>

          <div className="flex gap-2">
            {/* Optional filters can go here */}
            {isLoading && <Loader2 className="w-5 h-5 text-accent animate-spin" />}
          </div>
        </div>

        {isLoading ? (
          // SKELETON LOADER
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden h-[400px] animate-pulse">
                <div className="h-[300px] bg-white/5" />
                <div className="p-5 space-y-3">
                  <div className="h-6 w-2/3 bg-white/5 rounded" />
                  <div className="h-4 w-1/2 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredAgents.map(agent => (
              <TokenCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <div className="p-20 border border-dashed border-white/10 rounded-2xl text-center flex flex-col items-center justify-center gap-4 bg-white/[0.02]">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <Search className="w-8 h-8 text-text-dim" />
            </div>
            <h3 className="text-lg font-medium text-white">No agents found</h3>
            <p className="text-text-dim max-w-sm mx-auto">
              No active agents match your search criteria. Be the first to deploy one into the trenches.
            </p>
            <Link
              href="/create"
              className="mt-4 px-6 py-2.5 bg-accent hover:bg-accent-dim text-white rounded-xl font-medium transition-colors"
            >
              Deploy Agent
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
