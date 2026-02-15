'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAgents, type Agent } from '../lib/api'
import AgentCardV2 from '../components/AgentCardV2'
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

  // Filter out agents already shown in Graduation Row? 
  // Actually, standard practice is to show them in the grid too, or filter. 
  // Let's show all in grid, but Graduation Row highlights top ones.
  // "Live Feed: Below the row, a 3-column masonry grid of live tradable tokens."

  return (
    <div className="min-h-screen pb-20">

      {/* Search & Header (Simplified) */}
      <div className="flex justify-end items-center mb-12">
        {/* Search */}
        <div className="flex gap-4 items-center">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-hover:text-accent transition-colors" />
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-2 border-red-500">
        {agents.filter(a => a.launched || a.bondingProgress >= 100).length > 0 ? (
          agents
            .filter(a => a.launched || a.bondingProgress >= 100)
            .map(agent => (
              <AgentCardV2 key={agent.id} agent={agent} onClick={() => handleSelectAgent(agent)} />
            ))
        ) : (
          <div className="col-span-full py-32 text-center">
            <div className="text-text-dim font-mono mb-2">NO_LIVE_SIGNALS</div>
            <div className="text-xs text-text-dim/50">The trenches are empty. Go launch something.</div>
          </div>
        )}
      </div>

    </div>
  )
}
