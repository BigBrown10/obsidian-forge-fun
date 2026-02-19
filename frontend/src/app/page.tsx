'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Search, Egg, Activity } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAgents, type Agent } from '../lib/api'
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

  return (
    <div className="min-h-screen bg-base text-text-primary p-6 space-y-12">


      {/* Live Feed (Scanner/Terminal Style) */}

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
