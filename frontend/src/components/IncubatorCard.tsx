import React from 'react'
import { motion } from 'framer-motion'
import { type Agent } from '../lib/api'
import { Users, Timer, Target, Rocket, Zap } from 'lucide-react'
import { formatCompactNumber } from '../lib/formatting'

export default function IncubatorCard({ agent, onClick }: { agent: Agent, onClick?: () => void }) {
    // Mock data for stats
    const raised = agent.pledgedAmount ? parseFloat(formatCompactNumber(Number(agent.pledgedAmount))) : 0
    const target = agent.targetAmount ? parseFloat(formatCompactNumber(Number(agent.targetAmount))) : 10
    const progress = Math.min((raised / target) * 100, 100)

    // Safely parse metadata
    let metadata: any = {}
    try {
        metadata = agent.metadataURI && agent.metadataURI.startsWith('{') ? JSON.parse(agent.metadataURI) : {}
    } catch (e) { }

    const image = metadata.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${agent.ticker}`

    return (
        <motion.div
            whileHover={{ y: -4, scale: 1.01 }}
            className="group relative bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden cursor-pointer w-full aspect-[16/9] md:aspect-[2/1] shadow-2xl"
            onClick={onClick}
        >
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt={agent.name}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-[#0A0A0B]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0B]/80 via-transparent to-transparent" />
            </div>

            {/* Badges */}
            <div className="absolute top-6 left-6 flex gap-3">
                <div className="px-3 py-1.5 rounded-full bg-accent text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(124,58,237,0.5)]">
                    Featured
                </div>
                {agent.launched && (
                    <div className="p-1.5 rounded-full bg-red-500/20 text-red-500 border border-red-500/20">
                        <Zap className="w-3.5 h-3.5" />
                    </div>
                )}
            </div>

            {/* Right Top Actions */}
            <div className="absolute top-6 right-6 flex gap-2">
                <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur border border-white/10 text-xs text-text-dim font-mono">
                    Ends: 24h 12m
                </div>
            </div>


            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex flex-col justify-end h-full pointer-events-none">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-3xl font-bold text-white mb-2 leading-none drop-shadow-md">
                            {agent.name}
                        </h3>

                        {/* Stats Row */}
                        <div className="flex gap-8 mt-4">
                            <div>
                                <div className="text-[10px] text-text-dim uppercase tracking-widest mb-1">Price</div>
                                <div className="text-white font-mono font-bold">0.01 BNB</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-text-dim uppercase tracking-widest mb-1">Target</div>
                                <div className="text-white font-mono font-bold">{target} BNB</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-text-dim uppercase tracking-widest mb-1">Minted</div>
                                <div className="text-accent font-mono font-bold">{progress.toFixed(0)}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/20">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-xs font-bold text-success uppercase">Live</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-accent to-pink-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </motion.div>
    )
}
