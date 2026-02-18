'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Search, Egg, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAgents, type Agent } from '../lib/api'
import IncubatorCard from '../components/IncubatorCard'
import TokenCard from '../components/TokenCard'

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const router = useRouter()

  useEffect(() => {
    getAgents().then(setAgents)
    const interval = setInterval(() => getAgents().then(setAgents), 5000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectAgent = (agent: Agent) => {
    router.push(`/agent/${agent.ticker}`)
  }

  // Live Feed ONLY shows launched agents
  const launched = agents.filter(a => a.launched).slice(0, 50) // Show more since it's the main feed

  return (
    <div className="min-h-screen bg-base text-text-primary p-6 space-y-12">


      {/* Live Feed */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <h2 className="text-xl font-bold text-white">Ghost Signals <span className="text-text-dim text-sm font-normal">(Live Trading)</span></h2>
        </div>

        {launched.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {launched.map(agent => (
              <TokenCard key={agent.id} agent={agent} onClick={() => handleSelectAgent(agent)} />
            ))}
          </div>
        ) : (
          <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center text-text-dim">
            No live signals detected. Use the Launchpad to deploy.
          </div>
        )}
      </section>
    </div>
  )
}
