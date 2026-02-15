'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Users, Zap, TrendingUp, Clock } from 'lucide-react'
import { type Agent } from '../lib/api'
import { formatCompactNumber, formatCurrency } from '../lib/formatting'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useRouter } from 'next/navigation'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export default function AgentCard({ agent, onClick, minimalist = false }: { agent: Agent, onClick?: () => void, minimalist?: boolean }) {
    const router = useRouter()
    const isLaunched = agent.launched
    const metadata = agent.metadataURI ? JSON.parse(agent.metadataURI) : {}
    const image = metadata.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${agent.ticker}`

    // Metrics (Simulated or Real)
    // If not launched, we use bonding progress. If launched, we use simulated market data.
    const progress = Math.min(agent.bondingProgress, 100)
    const marketCap = isLaunched ? 420000 + (Number(agent.id) * 1500) : (Number(agent.pledgedAmount) / 10 ** 18) * 600 // Approx BNB price
    const percentage = isLaunched ? 12.5 : progress
    const isPositive = true // For now assumed positive

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
            className="group cursor-pointer bg-[#0A0A0A] hover:bg-[#111] border-b border-white/5 p-4 flex gap-4 items-start transition-colors"
        >
            {/* Image (Square, Clean) */}
            <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden shrink-0 relative">
                <img src={image} alt={agent.ticker} className="w-full h-full object-cover" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between h-16">

                {/* Row 1: Name & Ticker */}
                <div className="flex justify-between items-start">
                    <div className="flex items-baseline gap-2 min-w-0">
                        <h3 className="font-bold text-white text-sm truncate">{agent.name}</h3>
                        <span className="text-xs text-text-dim truncate">${agent.ticker}</span>
                    </div>
                    <div className="text-[10px] text-text-dim font-mono shrink-0">
                        {timeAgo(agent.createdAt || new Date().toISOString())}
                    </div>
                </div>

                {/* Row 2: Creator & Cap */}
                <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-1.5 text-text-dim">
                        <div className="w-4 h-4 rounded-full bg-white/10 overflow-hidden">
                            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.creator}`} className="w-full h-full" />
                        </div>
                        <span className="truncate max-w-[100px]">{agent.creator.slice(0, 6)}...</span>
                    </div>
                    <div className="font-mono text-white">
                        <span className="text-text-dim mr-1">MC</span>
                        ${formatCompactNumber(marketCap)}
                    </div>
                </div>

                {/* Row 3: Progress Bar */}
                <div className="flex items-center gap-3 mt-1">
                    <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full ${isLaunched ? 'bg-success' : 'bg-accent'}`}
                            style={{ width: `${Math.max(percentage, 5)}%` }}
                        />
                    </div>
                    <div className={`text-[10px] font-mono font-bold ${isPositive ? 'text-success' : 'text-danger'} w-12 text-right`}>
                        {isLaunched ? `↑ ${percentage}%` : `${percentage.toFixed(0)}%`}
                    </div>
                </div>

            </div>
        </motion.div>
    )
}
