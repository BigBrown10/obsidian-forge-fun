'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Egg, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getAgents, type Agent } from '../../lib/api'
import AgentCard from '../../components/AgentCard'

export default function Incubator() {
    const [agents, setAgents] = useState<Agent[]>([])
    const router = useRouter()

    useEffect(() => {
        getAgents().then(data => {
            // Filter for unlaunched agents (Ghost Proposals)
            setAgents(data.filter(a => !a.launched))
        })
    }, [])

    return (
        <div className="min-h-screen pb-20">
            <div className="flex justify-between items-end mb-12">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4 flex items-center gap-4"
                    >
                        <Egg className="w-12 h-12 text-accent" />
                        The_Incubator
                    </motion.h1>
                    <p className="text-text-secondary max-w-lg leading-relaxed">
                        Ghost Proposals awaiting ignition.
                        Pledge BNB to birth these entities into the network.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {agents.length > 0 ? (
                    agents.map(agent => (
                        <AgentCard key={agent.id} agent={agent} onClick={() => router.push(`/agent/${agent.ticker}`)} />
                    ))
                ) : (
                    <div className="col-span-full py-32 text-center border border-white/5 rounded-[32px] bg-surface/50">
                        <div className="text-text-dim font-mono mb-2">NO_GHOSTS_FOUND</div>
                        <div className="text-xs text-text-dim/50">The incubator is empty. Go to The Forge to spawn one.</div>
                    </div>
                )}
            </div>
        </div>
    )
}
