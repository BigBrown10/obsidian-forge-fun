'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Target, Rocket } from 'lucide-react'
import { type Agent } from '../lib/api'
import { formatCompactNumber } from '../lib/formatting'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useAgentMetadata } from '../hooks/useAgentMetadata'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export default function ICOCard({ agent, onClick }: { agent: Agent, onClick?: () => void }) {
    const { metadata } = useAgentMetadata(agent.metadataURI)
    const image = metadata?.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${agent.ticker}`
    const progress = Math.min(agent.bondingProgress, 100)
    const target = Number(agent.targetAmount)
    const raised = Number(agent.pledgedAmount)

    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onClick={onClick}
            className="group cursor-pointer relative bg-card rounded-[24px] border border-white/[0.03] overflow-hidden hover:shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)] transition-all duration-300 flex flex-col h-full"
        >
            {/* Top Image Area */}
            <div className="h-40 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
                <img src={image} alt={agent.ticker} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                <div className="absolute top-4 right-4 z-20">
                    <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-widest text-accent flex items-center gap-1">
                        <Rocket className="w-3 h-3" /> Incubating
                    </div>
                </div>
            </div>

            <div className="p-5 flex flex-col flex-1">
                {/* Identity */}
                <div className="mb-4">
                    <h3 className="font-bold text-white text-lg tracking-tight group-hover:text-accent transition-colors truncate">{agent.name}</h3>
                    <div className="flex items-center gap-2 text-text-dim text-xs font-mono">
                        <span>${agent.ticker}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {formatCompactNumber(42)} Backers</span>
                    </div>
                </div>

                {/* Progress Section */}
                <div className="mt-auto space-y-3">
                    <div className="flex justify-between text-xs font-mono">
                        <span className="text-text-dim">RAISED</span>
                        <span className="text-white">{progress.toFixed(1)}%</span>
                    </div>

                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full bg-gradient-to-r from-accent to-purple-400 shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                        />
                    </div>

                    <div className="flex justify-between items-end pt-2 border-t border-white/5">
                        <div>
                            <div className="text-[10px] uppercase text-text-dim">Soft Cap</div>
                            <div className="text-sm font-mono text-text-secondary">5 BNB</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] uppercase text-text-dim">Target</div>
                            <div className="text-sm font-mono text-white">{formatCompactNumber(target)} BNB</div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
