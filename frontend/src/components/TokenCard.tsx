import React from 'react'
import { motion } from 'framer-motion'
import { type Agent } from '../lib/api'
import { TrendingUp, MessageSquare, Activity } from 'lucide-react'
import { formatCompactNumber } from '../lib/formatting'

export default function TokenCard({ agent, onClick }: { agent: Agent, onClick?: () => void }) {
    // Mock market data
    const mcap = 12500 // Mock $12.5k
    const price = 0.000042
    const change24h = 12.5

    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="group flex flex-col bg-bg-card border border-white/5 rounded-xl overflow-hidden hover:border-success/30 transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="p-3 flex gap-3">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-lg bg-black/50 overflow-hidden flex-shrink-0 border border-white/5 group-hover:border-white/20">
                    <img
                        src={(() => {
                            try {
                                const fallback = `https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.ticker}`
                                return agent.metadataURI ? (JSON.parse(agent.metadataURI).image || fallback) : fallback
                            } catch {
                                return `https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.ticker}`
                            }
                        })()}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.ticker}`
                        }}
                        alt={agent.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="text-xs font-bold text-text-dim mb-0.5">Created by @Unknown</div>
                        <div className="flex gap-2 text-[10px] font-mono">
                            <span className="text-success bg-success/10 px-1.5 py-0.5 rounded">
                                MCAP ${formatCompactNumber(mcap)}
                            </span>
                            <span className="text-accent bg-accent/10 px-1.5 py-0.5 rounded">
                                VOL ${formatCompactNumber(1200)}
                            </span>
                        </div>
                    </div>

                    <h3 className="font-bold text-sm text-white truncate my-1">
                        {agent.name} <span className="text-text-dim font-normal text-xs uppercase">[${agent.ticker}]</span>
                    </h3>

                    <div className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                        {agent.description?.slice(0, 100) || "No description provided for this agent."}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
