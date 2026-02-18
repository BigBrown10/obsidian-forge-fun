import React from 'react'
import { motion } from 'framer-motion'
import { type Agent } from '../lib/api'
import { TrendingUp, MessageSquare, Activity, User, Globe, MessageCircle, Zap } from 'lucide-react'
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
            whileHover={{ y: -8, scale: 1.02 }}
            className="group flex flex-col bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden hover:border-accent/50 transition-all cursor-pointer shadow-xl hover:shadow-[0_0_30px_rgba(124,58,237,0.2)] relative"
            onClick={onClick}
        >
            {/* Status Badge */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                {isIncubator ? (
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/20 backdrop-blur-md uppercase tracking-wider shadow-lg">
                        Incubating
                    </span>
                ) : (
                    <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-success/20 text-success border border-success/20 backdrop-blur-md uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
                    </span>
                )}
            </div>

            {/* Image Area - Square Aspect */}
            <div className="aspect-square w-full relative bg-[#0A0A0B] overflow-hidden">
                <img
                    src={imageUrl}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://api.dicebear.com/9.x/avataaars/svg?seed=${agent.ticker}`
                    }}
                    alt={agent.name}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-transparent opacity-80" />

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-white text-2xl truncate leading-none drop-shadow-xl mb-2">
                        {agent.name}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-accent bg-black/60 px-2 py-1 rounded-lg border border-accent/20 backdrop-blur">
                            ${agent.ticker}
                        </span>
                        <span className="text-[10px] text-white/70 flex items-center gap-1 bg-black/40 px-2 py-1 rounded-lg backdrop-blur">
                            <User className="w-3 h-3" /> @{agent.creator.slice(0, 6)}...
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="p-5 flex flex-col gap-4 relative">
                {/* Decorative Glow */}
                <div className="absolute -top-10 left-0 right-0 h-10 bg-gradient-to-t from-[#0A0A0B] to-transparent" />

                {/* Metrics */}
                {isIncubator ? (
                    <div className="space-y-2">
                        <div className="flex justify-between text-[10px] uppercase font-bold text-text-dim tracking-wider">
                            <span>Raised</span>
                            <span className="text-blue-400">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <div
                                className="h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-text-dim font-mono">
                            <span>0 BNB</span>
                            <span>{formatCompactNumber(Number(agent.targetAmount || 10))} BNB</span>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                            <div className="text-[10px] text-text-dim uppercase tracking-wider mb-1">Mkt Cap</div>
                            <div className="font-mono font-bold text-white text-sm">${formatCompactNumber(mcap)}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors text-right">
                            <div className="text-[10px] text-text-dim uppercase tracking-wider mb-1">Price</div>
                            <div className="font-mono font-bold text-success text-sm">$0.00042</div>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <button className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg ${isIncubator
                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                    : 'bg-white/5 text-white border border-white/10 hover:bg-accent hover:border-accent hover:text-white hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]'
                    }`}>
                    {isIncubator ? 'View Incubator' : 'Trade Token'}
                </button>
            </div>
        </motion.div>
    )
}
