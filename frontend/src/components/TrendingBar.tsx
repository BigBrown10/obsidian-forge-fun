'use client'

import { Agent } from '../lib/api'

export default function TrendingBar({ tokens }: { tokens: Agent[] }) {
    // Sort by some metric, e.g. bondingProgress or just take first 3 for now
    const trending = tokens.slice(0, 3)

    if (trending.length === 0) return null

    return (
        <div className="w-full bg-surface border-b border-border-subtle overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 h-12 flex items-center gap-6 overflow-x-auto no-scrollbar">
                <span className="text-xs font-bold text-accent uppercase tracking-wider shrink-0 animate-pulse-purple">
                    Trending
                </span>

                {trending.map((token) => (
                    <div key={token.id} className="flex items-center gap-2 shrink-0 text-xs">
                        <span className="text-text-secondary font-mono">#{token.id}</span>
                        <div
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-black"
                            style={{ background: '#7c3aed' }}
                        >
                            {token.ticker.charAt(0)}
                        </div>
                        <span className="font-semibold text-text-primary">{token.ticker}</span>
                        <span className="text-accent">{token.bondingProgress.toFixed(1)}%</span>
                        <span className="text-text-dim">Bonding</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
