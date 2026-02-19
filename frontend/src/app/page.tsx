'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Search, Egg, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAgents, type Agent } from '../lib/api'
import IncubatorCard from '../components/IncubatorCard'
import TokenCard from '../components/TokenCard'
import TokenRow from '../components/TokenRow'

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

  const liveAgents = agents.filter(a => {
    // STRICT FILTER: Only Launched agents are Live.
    // If it's not launched, it's NOT live. Period.
    if (!a.launched) return false;

    // Double check metadata to ensure we don't accidentally show a "launched" incubator if that's even possible (it shouldn't be until TGE)
    // But for now, launched = true is the source of truth for "Live Trading".
    return true;
  }).sort((a, b) => Number(b.id) - Number(a.id))

  const incubatorAgents = agents.filter(a => {
    try {
      const m = a.metadataURI && a.metadataURI.startsWith('{') ? JSON.parse(a.metadataURI) : {}
      return m.launchMode === 'incubator' && !a.launched
    } catch { return false }
  })

  return (
    <div className="min-h-screen bg-base text-text-primary p-6 space-y-12">


      {/* Incubator Feed (Featured Drops Style) */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">Incubator</h2>
          </div>
          <Link
            href="/create?mode=incubator"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <Egg className="w-4 h-4" /> Start Incubation
          </Link>
        </div>

        {incubatorAgents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {incubatorAgents.map(agent => (
              <IncubatorCard key={agent.id} agent={agent} onClick={() => handleSelectAgent(agent)} />
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-white/10 rounded-2xl text-center text-text-dim text-sm">
            No active incubations. Be the first to start one.
          </div>
        )}
      </section>

      {/* Live Feed (Scanner/Terminal Style) */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <h2 className="text-xl font-bold text-white">Live Terminal</h2>
        </div>

        {liveAgents.length > 0 ? (
          <div className="flex flex-col border-t border-white/5">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] text-text-dim uppercase tracking-wider font-bold">
              <div className="col-span-4">Agent</div>
              <div className="col-span-2 hidden sm:block">Age</div>
              <div className="col-span-2 hidden sm:block">Liquidity</div>
              <div className="col-span-2 hidden sm:block">Volume</div>
              <div className="col-span-2 text-right pr-4">Action</div>
            </div>
            {liveAgents.map(agent => (
              <TokenRow key={agent.id} agent={agent} />
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
