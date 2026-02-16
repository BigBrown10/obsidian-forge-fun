'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAgents, type Agent } from '../lib/api'
import TrenchesGrid from '../components/TrenchesGrid'
import GraduationRow from '../components/GraduationRow'

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const router = useRouter()

  useEffect(() => {
    getAgents().then(setAgents)
    // Polling for liveness
    const interval = setInterval(() => getAgents().then(setAgents), 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectAgent = (agent: Agent) => {
    router.push(`/agent/${agent.ticker}`)
  }

  return (
    <div className="min-h-screen bg-base text-text-primary p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            The Trenches
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <p className="text-xs text-text-dim font-mono">LIVE_FEED :: CONNECTED</p>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Search Logic */}
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-4 text-text-dim group-hover:text-white transition-colors" />
            <input
              type="text"
              placeholder="SEARCH_SIGNAL..."
              className="w-64 h-12 pl-12 pr-4 bg-surface border border-border-subtle rounded-full text-xs text-white focus:outline-none focus:border-accent/50 transition-all font-mono placeholder:text-text-dim group-hover:border-border-hover"
            />
          </div>
        </div>
      </div>

      {/* Graduation Row (Marquee) */}
      <GraduationRow agents={agents} onSelect={handleSelectAgent} />

      {/* Main Grid: Nuclear Option (TrenchesGrid) */}
      <TrenchesGrid agents={agents} onSelect={handleSelectAgent} />
    </div>
  )
}
