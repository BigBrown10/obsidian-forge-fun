import React from 'react'
import { motion } from 'framer-motion'
import { type Agent } from '../lib/api'
import { TrendingUp, MessageSquare, Activity, User, Globe, MessageCircle } from 'lucide-react'
import { formatCompactNumber } from '../lib/formatting'

export default function TokenCard({ agent, onClick }: { agent: Agent, onClick?: () => void }) {
    // Mock market data (replace with real if available)
    const mcap = 12500
    const isIncubator = !agent.launched

    // Parsing metadata safely
    let metadata: any = {}
    try {
        metadata = agent.metadataURI && agent.metadataURI.startsWith('{') ? JSON.parse(agent.metadataURI) : {}
    } catch (e) {
        // ignore
    }

    const imageUrl = metadata.image || `https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.ticker}`

    // Progress bar for incubator
    const progress = Math.min(agent.bondingProgress || 0, 100)

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group flex flex-col bg-[#0A0A0B] border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all cursor-pointer shadow-lg relative"
            onClick={onClick}
        >
            {/* Status Badge */}
            <div className="absolute top-3 left-3 z-10 flex gap-2">
                {isIncubator ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20 backdrop-blur-md uppercase tracking-wide">
                        Incubating
                    </span>
                ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-success/20 text-success border border-success/20 backdrop-blur-md uppercase tracking-wide flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
                    </span>
                )}
            </div>

            {/* Image Area - Square Aspect */}
            <div className="aspect-square w-full relative bg-white/5 overflow-hidden group-hover:opacity-90 transition-opacity">
                <img
                    src={imageUrl}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.ticker}`
                    }}
                    alt={agent.name}
                    className="w-full h-full object-cover"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-60" />

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-bold text-white text-lg truncate leading-tight drop-shadow-md">
                        {agent.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs text-accent bg-black/40 px-1.5 py-0.5 rounded border border-white/10 backdrop-blur">
                            ${agent.ticker}
                        </span>
                        <span className="text-[10px] text-white/70 flex items-center gap-1">
                            <User className="w-3 h-3" /> @{agent.creator.slice(0, 6)}...
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-4 flex flex-col gap-4">
                {/* Description */}
                <div className="text-xs text-text-secondary line-clamp-2 h-8 leading-relaxed">
                    {metadata.description || agent.description || "No description provided."}
                </div>

                {/* Metrics */}
                {isIncubator ? (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-text-dim">
                            <span>Raised</span>
                            <span className="text-blue-400">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-text-dim">
                            <span>0 BNB</span>
                            <span>{formatCompactNumber(Number(agent.targetAmount || 10))} BNB</span>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between text-xs">
                        <div>
                            <div className="text-[10px] text-text-dim uppercase mb-0.5">Mkt Cap</div>
                            <div className="font-mono font-bold text-white">${formatCompactNumber(mcap)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-text-dim uppercase mb-0.5">Px</div>
                            <div className="font-mono font-bold text-success">$0.00042</div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button className={`w-full py-2 rounded-lg text-xs font-bold uppercase transition-colors ${isIncubator
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20'
                        : 'bg-white/5 text-white border border-white/10 hover:bg-accent hover:border-accent hover:text-white'
                    }`}>
                    {isIncubator ? 'View Incubator' : 'Trade Token'}
                </button>
            </div>
        </motion.div>
    )
}
