'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Shield, Wallet } from 'lucide-react'
import { useAccount } from 'wagmi'
import { getAgents, type Agent } from '../../lib/api'
import AgentCard from '../../components/AgentCard'

export default function Profile() {
    const { address, isConnected } = useAccount()
    const [myAgents, setMyAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (address) {
            getAgents().then(data => {
                // Filter agents created by current user
                const mine = data.filter(a => a.creator.toLowerCase() === address.toLowerCase())
                setMyAgents(mine)
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }, [address])

    if (!isConnected) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-text-dim" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Wallet Disconnected</h1>
            <p className="text-text-secondary">Please connect your wallet to view your dossier.</p>
        </div>
    )

    return (
        <div className="min-h-screen pb-20 max-w-7xl mx-auto px-6 pt-12">
            <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-purple-500 to-blue-600 shadow-xl shadow-purple-500/20" />
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Commander</h1>
                    <div className="flex items-center gap-2 text-text-dim font-mono text-sm bg-white/5 px-2 py-1 rounded-lg w-max">
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {/* Created Agents */}
                <section>
                    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                        <Shield className="w-5 h-5 text-accent" />
                        <h2 className="text-lg font-bold text-white tracking-wide uppercase">Deployed Entities</h2>
                        <span className="ml-auto text-xs text-text-dim font-mono">{myAgents.length} ACTIVE</span>
                    </div>

                    {myAgents.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myAgents.map(agent => (
                                <AgentCard key={agent.id} agent={agent} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center border border-dashed border-white/10 rounded-2xl">
                            <p className="text-text-dim">No entities deployed yet.</p>
                        </div>
                    )}
                </section>

                {/* Holdings (Placeholder) */}
                <section className="opacity-50 blur-[1px] select-none pointer-events-none relative">
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="bg-black/80 px-4 py-2 rounded-full border border-white/10 text-xs text-text-dim font-mono">
                            COMING_SOON
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                        <Wallet className="w-5 h-5 text-text-secondary" />
                        <h2 className="text-lg font-bold text-white tracking-wide uppercase">Asset Holdings</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}
