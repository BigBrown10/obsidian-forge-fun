'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getAgents, Agent } from '../../lib/api'
import { formatMarketCap } from '../../data/mock'

export default function Incubator() {
    const [agents, setAgents] = useState<Agent[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAgents().then(data => {
            // Filter for tokens that are still bonding
            setAgents(data.filter(t => t.bondingProgress < 100))
            setLoading(false)
        })
    }, [])

    return (
        <div className="min-h-full">
            <div className="max-w-6xl mx-auto px-5 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">Incubator</h1>
                    <p className="text-sm text-text-secondary">Pledge BNB to bootstrap new autonomous agents. Once the bonding curve hits 100%, the token launches on PancakeSwap.</p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-text-dim">Loading incubator...</div>
                ) : agents.length === 0 ? (
                    <div className="text-center py-20 text-text-dim">No active incubations.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {agents.map((token) => (
                            <div key={token.id} className="rounded-xl border border-border-subtle bg-card hover:border-border-hover transition-colors overflow-hidden group">
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-black"
                                                style={{ background: '#7c3aed' }}
                                            >
                                                {token.ticker.charAt(0)}
                                            </div>
                                            <div>
                                                <Link href={`/agent/${token.ticker}`} className="hover:underline">
                                                    <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{token.name}</h3>
                                                </Link>
                                                <span className="text-xs text-text-dim font-mono">${token.ticker}</span>
                                            </div>
                                        </div>
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-accent/10 text-accent">
                                            Raising
                                        </span>
                                    </div>

                                    {/* Desc */}
                                    <p className="text-xs text-text-secondary line-clamp-2 h-8 mb-4">
                                        {token.description || 'No description provided.'}
                                    </p>

                                    {/* Progress */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-text-dim">Bonding Curve</span>
                                            <span className="font-mono text-accent">{token.bondingProgress.toFixed(1)}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div className="progress-fill" style={{ width: `${token.bondingProgress}%` }} />
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-4 mb-5">
                                        <div>
                                            <div className="text-xs text-text-dim mb-0.5">Target</div>
                                            <div className="text-sm font-mono text-text-primary">{token.targetAmount} BNB</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-text-dim mb-0.5">Pledged</div>
                                            <div className="text-sm font-mono text-text-primary">{token.pledgedAmount} BNB</div>
                                        </div>
                                    </div>

                                    {/* Action */}
                                    <Link href={`/agent/${token.ticker}`} className="block w-full text-center py-2.5 rounded-lg bg-accent text-black text-sm font-semibold hover:bg-accent-dim transition-colors">
                                        Pledge Funds
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
