'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Zap, TrendingUp } from 'lucide-react'
import { type Agent } from '../lib/api'
import { formatCompactNumber, formatCurrency } from '../lib/formatting'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export default function AgentCard({ agent, onClick, minimalist = false }: { agent: Agent, onClick?: () => void, minimalist?: boolean }) {
    const isLaunched = agent.launched
    const metadata = agent.metadataURI ? JSON.parse(agent.metadataURI) : {}
    const image = metadata.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${agent.ticker}`

    // Simulate live data for Trenches feel
    // If incubating, these are 0 or N/A effectively, but this component is for Trenches (Live) mostly
    const marketCap = isLaunched ? 420000 + (Number(agent.id) * 1500) : 0
    const volume = isLaunched ? 1200000 : 0
    const price = isLaunched ? 0.00042 : 0
    const change24h = isLaunched ? 12.5 : 0
    const holders = isLaunched ? 420 + Number(agent.id) * 10 : 0

    return (
        <motion.div
            whileHover={{ y: -1, backgroundColor: 'rgba(255,255,255,0.03)' }}
            onClick={onClick}
            className="group cursor-pointer relative bg-surface border-b border-white/5 transition-colors p-4 flex items-center justify-between"
        >
            {/* Left: Identity */}
            <div className="flex items-center gap-4 w-[35%] shrink-0">
                <div className="w-10 h-10 rounded-xl bg-white/5 overflow-hidden border border-white/10 shrink-0 relative">
                    <img src={image} alt={agent.ticker} className="w-full h-full object-cover" />
                    {isLaunched && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-[#111]" />}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm truncate">{agent.name}</h3>
                        <span className="text-[10px] font-mono text-text-dim bg-white/5 px-1.5 rounded">${agent.ticker}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-text-dim mt-0.5">
                        <span className="flex items-center gap-1 text-accent font-medium"><Zap className="w-3 h-3" /> Live</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {formatCompactNumber(holders)}</span>
                    </div>
                </div>
            </div>

            {/* Right: Stats Grid */}
            <div className="flex items-center justify-end gap-6 sm:gap-12 w-full">

                <div className="text-right w-20 shrink-0">
                    <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Price</div>
                    <div className="font-mono text-sm text-white font-medium">${price.toFixed(5)}</div>
                </div>

                <div className="text-right w-20 shrink-0 hidden sm:block">
                    <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Mkt Cap</div>
                    <div className="font-mono text-sm text-text-secondary">{formatCompactNumber(marketCap)}</div>
                </div>

                <div className="text-right w-20 shrink-0 hidden md:block">
                    <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Vol (24h)</div>
                    <div className="font-mono text-sm text-text-secondary">{formatCompactNumber(volume)}</div>
                </div>

                <div className="text-right w-16 shrink-0">
                    <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">24h %</div>
                    <div className={`font-mono text-sm font-bold ${change24h >= 0 ? "text-success" : "text-danger"}`}>
                        {change24h > 0 ? '+' : ''}{change24h}%
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
