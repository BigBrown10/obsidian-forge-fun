'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { type Agent } from '../lib/api'
import { formatCompactNumber } from '../lib/formatting'
import { useRouter } from 'next/navigation'

export default function AgentCard({ agent, onClick }: { agent: Agent, onClick?: () => void }) {
    const router = useRouter()
    const isLaunched = agent.launched

    // Robust Avatar Fallback
    const image = `https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.ticker}`

    // Metrics
    const progress = Math.min(agent.bondingProgress || 0, 100)
    const marketCap = isLaunched ? 420000 + (Number(agent.id) * 1500) : (Number(agent.pledgedAmount || 0) / 10 ** 18) * 600
    const percentage = isLaunched ? 12.5 : progress
    const isPositive = true

    const timeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    }

    return (
        <motion.div
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
            onClick={onClick || (() => router.push(`/agent/${agent.ticker}`))}
            className="group cursor-pointer bg-[#0A0A0A] hover:bg-[#111] border-b border-white/5 p-5 transition-colors flex gap-5 items-start relative overflow-hidden"
        >
            {/* Image (Bigger: 80px) */}
            <div className="w-20 h-20 bg-white/5 rounded-xl overflow-hidden shrink-0 relative border border-white/5 z-10">
                <img
                    src={(() => {
                        try {
                            return agent.metadataURI ? (JSON.parse(agent.metadataURI).image || image) : image
                        } catch {
                            return image
                        }
                    })()}
                    alt={agent.ticker}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = image
                    }}
                />
            </div>

            {/* Content Container - No fixed height, use gap */}
            <div className="flex-1 min-w-0 flex flex-col justify-center min-h-[5rem] z-10 gap-2">

                {/* Row 1: Name & Ticker */}
                <div className="flex justify-between items-center w-full gap-2">
                    <div className="flex items-baseline gap-2 min-w-0 pr-2">
                        <h3 className="font-bold text-white text-base truncate leading-tight">{agent.name}</h3>
                        <span className="text-xs text-text-dim truncate shrink-0 font-mono">${agent.ticker}</span>
                    </div>
                    <div className="text-[10px] text-text-dim font-mono shrink-0 whitespace-nowrap ml-auto">
                        {timeAgo(agent.createdAt || new Date().toISOString())}
                    </div>
                </div>

                {/* Row 2: Creator & Cap */}
                <div className="flex justify-between items-center text-xs w-full relative">
                    <div className="flex items-center gap-1.5 text-text-dim min-w-0 max-w-[50%]">
                        <div className="w-4 h-4 rounded-full bg-white/10 overflow-hidden shrink-0">
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.creator}`} className="w-full h-full" />
                        </div>
                        <span className="truncate opacity-70 hover:opacity-100 transition-opacity">{agent.creator.slice(0, 6)}...</span>
                    </div>
                    {/* Market Cap - Aligned right */}
                    <div className="font-mono text-white whitespace-nowrap ml-auto bg-[#0A0A0A]/90 pl-2 rounded-l">
                        <span className="text-text-dim mr-1 text-[10px] uppercase tracking-wide">MC</span>
                        ${formatCompactNumber(marketCap)}
                    </div>
                </div>

                {/* Row 3: Progress Bar */}
                <div className="flex items-center gap-3 w-full mt-1">
                    <div className="flex-1 h-2 bg-[#222] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${isLaunched ? 'bg-success' : 'bg-accent'} shadow-[0_0_10px_rgba(59,130,246,0.5)]`}
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                    </div>
                    <div className={`text-[10px] font-mono font-bold ${isPositive ? 'text-success' : 'text-danger'} w-10 text-right shrink-0`}>
                        {isLaunched ? `↑${percentage.toFixed(0)}%` : `${percentage.toFixed(0)}%`}
                    </div>
                </div>

            </div>
        </motion.div>
    )
}
