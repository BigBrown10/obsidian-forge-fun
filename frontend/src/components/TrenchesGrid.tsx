'use client'

import React from 'react'
import { type Agent } from '../lib/api'
import TrenchesCard from './TrenchesCard'

export default function TrenchesGrid({
    agents,
    onSelect
}: {
    agents: Agent[],
    onSelect: (agent: Agent) => void
}) {
    // Strict filtering: Only launched or full bonding
    const activeAgents = agents.filter(a => a.launched || a.bondingProgress >= 100)

    if (activeAgents.length === 0) {
        return (
            <div className="col-span-full py-32 text-center border border-border-subtle rounded-xl bg-surface/50">
                <div className="text-text-dim font-mono mb-2">NO_LIVE_SIGNALS</div>
                <div className="text-xs text-text-dim/50">The trenches are empty. Go launch something.</div>
            </div>
        )
    }

    return (
        // Nuclear Option: Gold Border to prove deployment
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-2 border-yellow-500/50 p-4 rounded-xl bg-surface/20">
            {activeAgents.map(agent => (
                <TrenchesCard
                    key={agent.id}
                    agent={agent}
                    onClick={() => onSelect(agent)}
                />
            ))}
        </div>
    )
}
