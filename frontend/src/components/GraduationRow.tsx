'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { type Agent } from '../lib/api'
import AgentCard from './AgentCard'
import { Flame } from 'lucide-react'

export default function GraduationRow({ agents, onSelect }: { agents: Agent[], onSelect: (a: Agent) => void }) {
    // Filter for agents close to graduation (>80% bonding) or recently launched
    const hotAgents = agents.filter(a => a.bondingProgress > 80 || a.launched).slice(0, 5)

    if (hotAgents.length === 0) return null

    return (
        <div className="mb-12">
            <div className="flex items-center gap-2 mb-6 text-white/50 px-2">
                <Flame className="w-4 h-4 text-accent animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase">Approaching Critical Velocity</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hotAgents.map(agent => (
                    <div key={agent.id} className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-blue-600 rounded-[26px] blur opacity-30 group-hover:opacity-75 transition duration-500" />
                        <AgentCard agent={agent} onClick={() => onSelect(agent)} />
                    </div>
                ))}
            </div>
        </div>
    )
}
