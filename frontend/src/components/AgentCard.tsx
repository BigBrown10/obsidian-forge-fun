'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, User } from 'lucide-react'
import { type Agent } from '../lib/api'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export default function AgentCard({ agent, onClick, minimalist = false }: { agent: Agent, onClick?: () => void, minimalist?: boolean }) {
    const isLaunched = agent.launched
    const metadata = agent.metadataURI ? JSON.parse(agent.metadataURI) : {}
    const image = metadata.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${agent.ticker}`

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={onClick}
            className="group cursor-pointer relative bg-card rounded-[24px] border border-white/[0.03] overflow-hidden hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)] transition-all duration-300"
        >
            {/* Electric Purple Ring (Fade in on hover) */}
            <div className="absolute inset-0 border border-accent/0 group-hover:border-accent/50 rounded-[24px] transition-colors duration-300 pointer-events-none z-10" />

            <div className="p-5 flex flex-col h-full justify-between">
                {/* Top Row: Identity */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-[12px] bg-white/5 overflow-hidden">
                            <img src={image} alt={agent.ticker} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white text-sm tracking-tight group-hover:text-accent transition-colors">{agent.name}</h3>
                            <span className="font-mono text-xs text-text-dim">${agent.ticker}</span>
                        </div>
                    </div>
                    {/* Status Indicator */}
                    <div className={cn(
                        "w-2 h-2 rounded-full shadow-[0_0_8px]",
                        isLaunched ? "bg-success shadow-success" : "bg-accent shadow-accent"
                    )} />
                </div>

                {/* Middle: Spacer (formerly Sparkline) */}
                <div className="flex-1" />

                {/* Bottom: Stats */}
                <div className="mt-auto pt-4 border-t border-white/5 flex items-end justify-between">
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-text-dim mb-1">Market Cap</div>
                        <div className="font-mono text-sm text-white font-medium">
                            {isLaunched ? '$420k' : `$${(Number(agent.pledgedAmount) * 600).toLocaleString()}`}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-widest text-text-dim mb-1">
                            {isLaunched ? 'Vol (24h)' : 'Bonding'}
                        </div>
                        <div className={cn("font-mono text-sm font-medium", isLaunched ? "text-success" : "text-accent")}>
                            {isLaunched ? '$1.2M' : `${agent.bondingProgress}%`}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
