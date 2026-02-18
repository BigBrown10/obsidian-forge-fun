import React from 'react'
import { motion } from 'framer-motion'
import { type Agent } from '../lib/api'
import { Users, Timer, Target } from 'lucide-react'
import { formatCompactNumber } from '../lib/formatting'

export default function IncubatorCard({ agent, onClick }: { agent: Agent, onClick?: () => void }) {
    // Mock data for incubation progress (since it's not in the Agent type yet)
    const raised = 0.8
    const target = 5.0
    const progress = (raised / target) * 100
    const backers = 42

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="group relative bg-bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-accent/30 transition-all cursor-pointer"
            onClick={onClick}
        >
            {/* Image & Overlay */}
            <div className="aspect-[1.5] relative bg-black/50">
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
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
                <div className="absolute top-3 right-3">
                    <div className="px-2 py-1 rounded-md bg-black/60 backdrop-blur border border-white/10 text-[10px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        Incubating
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-accent transition-colors truncate">
                        {agent.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-text-dim">
                        <span className="font-mono">${agent.ticker}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {backers} Backers
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Raised</span>
                        <span className="text-white font-mono">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-accent rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-text-dim font-mono">
                        <span>{raised} BNB</span>
                        <span>TARGET: {target} BNB</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
