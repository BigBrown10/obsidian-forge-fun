'use client'

import React, { useState, useEffect } from 'react'
import { Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAgents, type Agent } from '../../lib/api'
import ICOCard from '../../components/ICOCard'

export default function Launchpad() {
    const [agents, setAgents] = useState<Agent[]>([])
    const router = useRouter()

    useEffect(() => {
        getAgents().then(data => {
            // Launchpad shows UNLAUNCHED agents (Bonding in progress)
            setAgents(data.filter(a => !a.launched))
        })
        const interval = setInterval(() => {
            getAgents().then(data => setAgents(data.filter(a => !a.launched)))
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="min-h-screen pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                    <Rocket className="w-6 h-6 text-accent" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">The Launchpad</h1>
                    <p className="text-sm text-text-dim">Early stage ICOs. Fund the next generation of autonomous agents.</p>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agents.length > 0 ? (
                    agents.map(agent => (
                        <ICOCard key={agent.id} agent={agent} onClick={() => router.push(`/agent/${agent.ticker}`)} />
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center border border-white/5 rounded-[32px] bg-surface/50">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                            <Rocket className="w-8 h-8 text-text-dim" />
                        </div>
                        <div className="text-text-dim font-mono mb-2">NO_ICOS_ACTIVE</div>
                        <div className="text-xs text-text-dim/50 max-w-md mx-auto">
                            The launchpad is currently empty. Be the first to launch a new agent.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
