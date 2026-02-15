'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Activity, ExternalLink } from 'lucide-react'
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
    const marketCap = isLaunched ? 420000 + (Number(agent.id) * 1500) : Number(agent.pledgedAmount) * 600
    const volume = isLaunched ? 1200000 : 0
    const price = isLaunched ? 0.00042 : 0.00001
    const change24h = isLaunched ? 12.5 : 0

    return (
        <motion.div
            whileHover={{ y: -2 }}
            onClick={onClick}
            className="group cursor-pointer relative bg-surface border-b border-white/5 hover:bg-white/[0.02] transition-colors p-4 flex items-center justify-between"
        >
            {/* Left: Identity */}
            <div className="flex items-center gap-4 w-[30%]">
                <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden border border-white/10 shrink-0">
                    <img src={image} alt={agent.ticker} className="w-full h-full object-cover" />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm truncate max-w-[120px]">{agent.name}</h3>
                        <span className="text-[10px] font-mono text-text-dim bg-white/5 px-1.5 rounded">${agent.ticker}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-text-dim mt-0.5">
                        <Activity className="w-3 h-3" />
                        <span>Live on Forge</span>
                    </div>
                </div>
            </div>

            {/* Middle: Stats */}
            <div className="flex items-center gap-8 w-[40%] justify-center">
                <div className="text-right">
                    <div className="text-[10px] text-text-dim uppercase">Price</div>
                    <div className="font-mono text-sm text-white">${price.toFixed(5)}</div>
                </div>
                <div className="text-right">
                    <div className="text-[10px] text-text-dim uppercase">Mkt Cap</div>
                    <div className="font-mono text-sm text-white">{formatCurrency(marketCap)}</div>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-[10px] text-text-dim uppercase">24h Vol</div>
                    <div className="font-mono text-sm text-white">{formatCurrency(volume)}</div>
                </div>
            </div>

            {/* Right: Action / Sparkline */}
            <div className="flex items-center justify-end gap-4 w-[30%]">
                {/* Sparkline Placeholder */}
                <div className="w-24 h-8 opacity-50 hidden sm:block">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                        <path d="M0,30 L10,25 L20,28 L30,15 L40,20 L50,10 L60,18 L70,5 L80,12 L90,8 L100,2" fill="none" stroke={change24h >= 0 ? "#10B981" : "#EF4444"} strokeWidth="2" />
                    </svg>
                </div>

                <div className={`text-xs font-mono font-bold ${change24h >= 0 ? "text-success" : "text-danger"}`}>
                    {change24h > 0 ? '+' : ''}{change24h}%
                </div>
            </div>
        </motion.div>
    )
}
