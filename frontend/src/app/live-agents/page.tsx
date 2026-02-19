'use client'

export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Activity, Rocket, Info } from 'lucide-react'
import { getAgents, type Agent } from '../../lib/api'
import TokenRow from '../../components/TokenRow'

export default function LiveAgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const data = await getAgents()
                setAgents(data)
            } finally {
                setLoading(false)
            }
        }

        fetchAgents()
        const interval = setInterval(fetchAgents, 10000)

        // WebSocket logic
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'
        const socket = new WebSocket(wsUrl)

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                if (data.type === 'AGENTS_UPDATED') {
                    setAgents(data.agents)
                }
            } catch (err) { }
        }

        return () => {
            clearInterval(interval)
            socket.close()
        }
    }, [])

    const liveAgents = agents.filter(a => a.launched || a.launchMode === 'instant')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <div className="min-h-screen bg-base text-text-primary p-6 lg:p-12 space-y-8">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20">
                        <Rocket className="w-6 h-6 text-accent" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Live Agents</h1>
                </div>
                <p className="text-text-dim max-w-2xl">
                    Real-time feed of all agents currently active and trading on the network.
                    Use the Launchpad to add your own agent to this list.
                </p>
            </header>

            <section className="bg-surface/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-success animate-pulse" />
                        <span className="text-sm font-medium text-white">Live Operations</span>
                    </div>
                    <span className="text-xs text-text-dim px-2 py-1 rounded bg-white/5 border border-white/10 uppercase font-mono">
                        {liveAgents.length} Agents Online
                    </span>
                </div>

                {loading ? (
                    <div className="p-20 text-center animate-pulse text-text-dim">
                        Connecting to Obsidian Core...
                    </div>
                ) : liveAgents.length > 0 ? (
                    <div className="flex flex-col">
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] text-text-dim uppercase tracking-wider font-bold border-b border-white/5 bg-white/5">
                            <div className="col-span-4">Identity</div>
                            <div className="col-span-2 hidden sm:block">Status</div>
                            <div className="col-span-2 hidden sm:block">Market Cap</div>
                            <div className="col-span-2 hidden sm:block">24h Vol</div>
                            <div className="col-span-2 text-right pr-4">Action</div>
                        </div>
                        {liveAgents.map(agent => (
                            <TokenRow key={agent.id} agent={agent} />
                        ))}
                    </div>
                ) : (
                    <div className="p-20 text-center space-y-4">
                        <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                            <Info className="w-8 h-8 text-text-dim" />
                        </div>
                        <p className="text-lg text-white font-medium">No live agents detected</p>
                        <p className="text-text-dim max-w-sm mx-auto">
                            We couldn't find any tokens launched in the last 48 hours.
                            Newly created agents will appear here automatically.
                        </p>
                    </div>
                )}
            </section>
        </div>
    )
}
