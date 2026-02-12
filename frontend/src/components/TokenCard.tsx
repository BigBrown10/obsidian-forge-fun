'use client'

import Link from 'next/link'
import { Agent } from '../lib/api'
import { formatMarketCap } from '../data/mock'

export default function TokenCard({ token }: { token: Agent }) {
    // Compute/mock missing UI fields
    const marketCap = 0 // token.pledgedAmount * price... but simpler for now
    const priceChange = 0
    const replies = 0
    const color = '#7c3aed' // Default purple

    return (
        <Link
            href={`/agent/${token.ticker}`}
            className="block rounded-3xl bg-card hover:bg-card-hover transition-all duration-300 group relative overflow-hidden ring-1 ring-white/5 hover:ring-accent hover:shadow-glow hover:-translate-y-1 mb-5 break-inside-avoid"
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <div className="p-6 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 items-center">
                        <div
                            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-black shadow-lg shadow-accent/20"
                            style={{ background: color }}
                        >
                            {token.ticker.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-white group-hover:text-accent transition-colors leading-tight">{token.name}</h3>
                            <span className="text-xs text-text-dim font-mono tracking-wider">${token.ticker}</span>
                        </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-widest text-text-dim border border-border-subtle px-2 py-1 rounded-full">
                        GEN-{token.id}
                    </span>
                </div>

                {/* Description */}
                <p className="text-sm text-text-secondary line-clamp-2 h-10 mb-6 font-light leading-relaxed">
                    {token.metadataURI.includes('{')
                        ? JSON.parse(token.metadataURI).description
                        : token.metadataURI || 'No description'}
                </p>

                {/* Spark Meter (Progress) */}
                <div className="mb-6">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider mb-2">
                        <span className="text-text-dim">Bonding Progress</span>
                        <span className="font-mono text-accent">{token.bondingProgress.toFixed(1)}%</span>
                    </div>
                    <div className="spark-meter">
                        <div className="spark-fill" style={{ width: `${token.bondingProgress}%` }} />
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="flex items-center justify-between text-xs border-t border-border-subtle pt-4 mt-auto">
                    <div>
                        <div className="text-text-dim mb-1">Market Cap</div>
                        <div className="font-mono text-text-primary">$0.00</div>
                    </div>
                    <div className="text-right">
                        <div className="text-text-dim mb-1">Status</div>
                        <div className="flex items-center gap-1.5 justify-end">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                            <span className="text-success">Live</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}
