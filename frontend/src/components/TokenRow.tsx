'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { formatCompactNumber } from '../lib/formatting'
import { Zap, Rocket, Activity, Globe, Twitter, MessageCircle } from 'lucide-react'

interface TokenRowProps {
    agent: any
}

export default function TokenRow({ agent }: TokenRowProps) {
    const router = useRouter()

    const mcap = agent.marketCap || 0
    const liquidity = agent.liquidity || 0
    const volume = agent.volume24h || 0
    const txCount = agent.txCount24h || 0
    const price = agent.price || 0
    const createdAt = agent.createdAt ? parseInt(agent.createdAt) : Date.now() / 1000
    const timeSinceCreation = getTimeSince(createdAt)

    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative grid grid-cols-12 gap-4 items-center p-3 sm:px-4 border-b border-white/5 bg-[#0A0A0B]/50 hover:bg-[#1A1A1C] transition-colors cursor-pointer"
            onClick={() => router.push(`/agent/${agent.ticker}`)}
        >
            {/* HOVER GLOW */}
            <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/5 transition-colors pointer-events-none" />
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-accent/0 group-hover:bg-accent transition-colors" />

            {/* COL 1-4: IDENTITY */}
            <div className="col-span-12 sm:col-span-4 flex items-center gap-3 overflow-hidden">
                {/* Image */}
                <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden border border-white/10 group-hover:border-accent/50 transition-colors">
                    {agent.metadata?.image ? (
                        <img src={agent.metadata.image} alt={agent.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                            <Rocket className="w-4 h-4 text-white/30" />
                        </div>
                    )}
                </div>

                {/* Name/Ticker */}
                <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm truncate">{agent.name}</span>
                        <span className="text-xs font-mono text-accent bg-accent/10 px-1 rounded border border-accent/20">
                            ${agent.ticker}
                        </span>
                    </div>
                </div>
            </div>

            {/* COL 5-6: AGE (Hidden on mobile) */}
            <div className="hidden sm:block sm:col-span-2">
                <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Age</div>
                <div className="font-mono text-green-400 text-sm">{timeSinceCreation}</div>
            </div>

            {/* COL 7-8: LIQUIDITY / CAP (Hidden on mobile) */}
            <div className="hidden sm:block sm:col-span-2">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between w-24">
                        <span className="text-[10px] text-text-dim">MC</span>
                        <span className="font-mono text-white text-xs">${formatCompactNumber(mcap)}</span>
                    </div>
                    <div className="flex justify-between w-24">
                        <span className="text-[10px] text-text-dim">Liq</span>
                        <span className="font-mono text-text-secondary text-xs">${formatCompactNumber(liquidity)}</span>
                    </div>
                </div>
            </div>

            {/* COL 9-10: VOLUME (Hidden on mobile) */}
            <div className="hidden sm:block sm:col-span-2">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between w-24">
                        <span className="text-[10px] text-text-dim">Vol</span>
                        <span className="font-mono text-white text-xs">${formatCompactNumber(volume)}</span>
                    </div>
                    <div className="flex justify-between w-24">
                        <span className="text-[10px] text-text-dim">Tx</span>
                        <span className="font-mono text-text-secondary text-xs">{txCount}</span>
                    </div>
                </div>
            </div>

            {/* COL 11-12: ACTION (Visible on mobile as Col-5-12 equivalent) */}
            <div className="col-span-12 sm:col-span-2 flex justify-end items-center">
                <button
                    className="px-4 py-1.5 rounded bg-green-500/10 border border-green-500/50 text-green-400 text-xs font-bold uppercase tracking-wider hover:bg-green-500 hover:text-black transition-all shadow-[0_0_10px_rgba(34,197,94,0.1)] hover:shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/agent/${agent.ticker}`)
                    }}
                >
                    Quick Buy
                </button>
            </div>
        </motion.div>
    )
}

function getTimeSince(timestamp: number) {
    const seconds = Math.floor((Date.now() - timestamp * 1000) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";

    return Math.floor(seconds) + "s";
}
