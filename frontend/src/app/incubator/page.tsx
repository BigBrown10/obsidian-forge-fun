'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAgents, type Agent } from '../../lib/api'
import IncubatorCard from '../../components/IncubatorCard'
import { Egg } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default function IncubatorPage() {
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

    // Incubator ONLY shows unlaunched agents that are NOT instant launch
    const incubating = agents.filter(a => {
        // Parse metadata to check launchMode
        let metadata: any = {}
        try {
            metadata = a.metadataURI && a.metadataURI.startsWith('{') ? JSON.parse(a.metadataURI) : {}
        } catch (e) { console.error("Metadata parse error", e) }

        const launchMode = metadata.launchMode || 'instant' // Default to instant for legacy? Or incubator?
        // Actually, if it's not launched, it might be instant waiting for pledge?
        // But instant logic in create page sets launched=true optimistically.
        // So checking !launched should be enough IF instant launch sets launched=true.
        // However, user said "delete the instant tokens from incubator".
        // Let's be explicit:
        return !a.launched && launchMode === 'incubator'
    })

    return (
        <div className="min-h-screen bg-base text-text-primary p-6 space-y-12">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-white">
                        Incubator
                    </h1>
                    <p className="text-xs text-text-dim font-mono mt-1">L2_GENESIS_POOL_ACTIVE</p>
                </div>
            </div>

            {/* Incubator Feed */}
            <section>
                {incubating.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {incubating.map(agent => (
                            <IncubatorCard key={agent.id} agent={agent} onClick={() => handleSelectAgent(agent)} />
                        ))}
                    </div>
                ) : (
                    <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center text-text-dim">
                        No active incubations. Start a new one.
                    </div>
                )}
            </section>
        </div>
    )
}
