'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI } from '../../../lib/contracts'
import { getAgentByTicker, type Agent } from '../../../lib/api'
import { formatMarketCap } from '../../../data/mock'
import ManageAgent from './manage'
import { ChevronLeft, Brain, Activity, Gavel, Wallet, Terminal, Zap } from 'lucide-react'

export default function AgentDetail({ params }: { params: Promise<{ ticker: string }> }) {
    const [resolvedParams, setResolvedParams] = useState<{ ticker: string } | null>(null)
    const [agent, setAgent] = useState<Agent | null>(null)
    const [loading, setLoading] = useState(true)
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState('')
    const [activeTab, setActiveTab] = useState<'chart' | 'manage'>('chart')
    const [logs, setLogs] = useState<any[]>([])

    const { isConnected, address } = useAccount()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()

    const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    useEffect(() => {
        params.then(setResolvedParams)
    }, [params])

    useEffect(() => {
        if (resolvedParams) {
            let retries = 0
            const maxRetries = 15 // 30 seconds total wait

            const fetchAgent = () => {
                getAgentByTicker(resolvedParams.ticker)
                    .then(data => {
                        if (data) {
                            setAgent(data)
                            setLoading(false)
                        } else if (retries < maxRetries) {
                            retries++
                            setTimeout(fetchAgent, 2000)
                        } else {
                            setLoading(false) // Trigger Signal Lost
                        }
                    })
                    .catch(() => {
                        if (retries < maxRetries) {
                            retries++
                            setTimeout(fetchAgent, 2000)
                        } else {
                            setLoading(false)
                        }
                    })
            }
            fetchAgent()
        }
    }, [resolvedParams])

    const handleBuy = () => {
        if (!isConnected) return alert('Please connect your wallet first')
        if (chainId !== 97) {
            switchChain({ chainId: 97 })
            return
        }
        if (!amount || parseFloat(amount) <= 0) return alert('Enter a valid amount')
        if (!agent) return

        try {
            writeContract({
                address: LAUNCHPAD_ADDRESS,
                abi: LAUNCHPAD_ABI,
                functionName: 'pledge',
                args: [BigInt(agent.id)],
                value: parseEther(amount),
            })
        } catch (err) {
            console.error('Write contract failed:', err)
            alert('Transaction failed to start. Check console.')
        }
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <div className="text-text-dim text-sm font-mono tracking-widest uppercase">Establishing Uplink...</div>
        </div>
    )
    if (!agent) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-text-dim space-y-4">
            <div className="text-xl font-bold text-white">Signal Lost</div>
            <p className="text-sm max-w-md text-center">The requested agent uplink could not be established. It may still be initializing in the Forge.</p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 flex items-center gap-2"
            >
                <Zap className="w-4 h-4 text-accent" /> Retry Connection
            </button>
        </div>
    )

    const isCreator = isConnected && agent && address && agent.creator.toLowerCase() === address.toLowerCase()

    return (
        <div className="h-[calc(100vh-32px)] flex flex-col gap-6 overflow-hidden max-w-[1920px] mx-auto">
            {/* Header / Stats Bar */}
            <motion.div
                initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="h-20 rounded-[24px] bg-surface/80 backdrop-blur-xl border border-white/5 flex items-center px-8 justify-between shrink-0 z-20 shadow-lg"
            >
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 text-text-dim hover:text-white transition-colors group">
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/5">
                            <ChevronLeft className="w-4 h-4" />
                        </div>
                    </Link>
                    <div className="h-8 w-[1px] bg-white/5" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[16px] bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center text-xl font-bold text-white shadow-inner border border-white/10 overflow-hidden">
                            {agent.metadataURI?.includes('http') ? (
                                <img src={JSON.parse(agent.metadataURI).image} alt={agent.ticker} className="w-full h-full object-cover" />
                            ) : (
                                <span>{agent.ticker.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold leading-none text-white tracking-tight">{agent.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-accent font-mono tracking-wider bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">${agent.ticker}</span>
                                {isCreator && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">CREATOR_MODE</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <Stat label="Market Cap" value={formatMarketCap(0)} />
                    <Stat label="Bonding" value={`${agent.bondingProgress.toFixed(1)}%`} color="text-accent" />
                    <Stat label="Status" value="Live" color="text-success" indicator />
                </div>
            </motion.div>


            {/* 3-Panel Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">

                {/* LEFT: Thought Stream (Logic) */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}
                    className="lg:col-span-3 rounded-[32px] bg-surface/50 backdrop-blur-md border border-white/5 flex flex-col overflow-hidden relative order-3 lg:order-1 h-[500px] lg:h-auto"
                >
                    <div className="scanline-overlay opacity-30" />
                    <PanelHeader icon={Brain} title="Thought Stream" />
                    <div className="flex-1 overflow-y-auto p-0 relative custom-scrollbar">
                        <SocialFeed ticker={agent.ticker} agentId={agent.id} setLogs={setLogs} />
                    </div>
                </motion.div>

                {/* CENTER: Visuals & Data */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                    className="lg:col-span-6 rounded-[32px] bg-surface/50 backdrop-blur-md border border-white/5 flex flex-col overflow-hidden order-1 lg:order-2 min-h-[500px]"
                >


                    <div className="flex-1 overflow-hidden relative">
                        {activeTab === 'manage' ? (
                            <div className="h-full overflow-y-auto p-8">
                                <ManageAgent agent={agent} />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                {/* Chart Area */}
                                <div className="flex-1 relative flex items-center justify-center group overflow-hidden">
                                    {agent.bondingProgress >= 100 ? (
                                        // Live Chart View
                                        <div className="w-full h-full bg-[#0A0A0B] relative">
                                            <iframe
                                                src={`https://dexscreener.com/bsc/${LAUNCHPAD_ADDRESS}?embed=1&theme=dark&trades=0&info=0`}
                                                className="w-full h-full border-0"
                                            />
                                        </div>
                                    ) : (
                                        // Incubator / Launchpad View
                                        <div className="text-center z-10 p-12">
                                            <div className="relative w-32 h-32 mx-auto mb-6">
                                                <div className="absolute inset-0 bg-accent blur-[60px] opacity-20 animate-pulse" />
                                                <div className="relative w-full h-full rounded-full border-4 border-accent/30 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                                    <span className="text-3xl font-bold text-white">{agent.bondingProgress.toFixed(0)}%</span>
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2">Incubation in Progress</h3>
                                            <p className="text-text-dim text-sm max-w-sm mx-auto mb-6">
                                                This agent is currently in the bonding phase. Once the curve reaches 100%, it will graduate to the live market.
                                            </p>

                                            <div className="flex justify-center gap-4">
                                                <div className="px-4 py-2 rounded-lg bg-surface border border-white/5 text-xs font-mono text-text-dim">
                                                    TARGET: <span className="text-white">10 BNB</span>
                                                </div>
                                                <div className="px-4 py-2 rounded-lg bg-surface border border-white/5 text-xs font-mono text-text-dim">
                                                    RAISED: <span className="text-accent">{(10 * agent.bondingProgress / 100).toFixed(2)} BNB</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Terminal Logs */}
                                <div className="h-48 border-t border-white/5 bg-[#050505] p-5 font-mono text-xs overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center gap-2 text-text-dim uppercase text-[10px] tracking-widest mb-3 opacity-50">
                                        <Terminal className="w-3 h-3" /> System Logs
                                    </div>
                                    <div className="space-y-1.5 text-text-secondary/80 font-light">
                                        {logs.length > 0 ? logs.map((log, i) => (
                                            <LogEntry key={i} type={log.type} msg={log.msg} timestamp={log.timestamp} />
                                        )) : (
                                            <div className="text-text-dim/30">Waiting for agent loop...</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>


                {/* RIGHT: Command (Trade & Gov) */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                    className="lg:col-span-3 rounded-[32px] bg-surface/50 backdrop-blur-md border border-white/5 flex flex-col overflow-hidden order-2 lg:order-3"
                >
                    <PanelHeader icon={Gavel} title="Command Center" />

                    <div className="p-6 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                        {/* Trade Module */}
                        <div>
                            <div className="p-1 rounded-xl bg-black/40 border border-white/5 flex gap-1 mb-6">
                                <TradeTab active={tradeType === 'buy'} onClick={() => setTradeType('buy')} label="Buy" type="buy" />
                                <TradeTab active={tradeType === 'sell'} onClick={() => setTradeType('sell')} label="Sell" type="sell" />
                            </div>

                            <div className="space-y-4">
                                <AmountInput value={amount} onChange={setAmount} />
                                <div className="flex gap-2">
                                    {['0.1', '0.5', '1.0', 'MAX'].map((val) => (
                                        <QuickAmount key={val} value={val} onClick={() => setAmount(val === 'MAX' ? '5.0' : val)} />
                                    ))}
                                </div>
                            </div>

                            {/* Bonding Curve */}
                            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5">
                                <div className="flex justify-between text-[10px] uppercase text-text-dim mb-2">
                                    <span>Bonding Progress</span>
                                    <span className="text-white font-mono">{agent.bondingProgress.toFixed(1)}%</span>
                                </div>
                                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }} animate={{ width: `${agent.bondingProgress}%` }}
                                        className="h-full bg-accent shadow-[0_0_10px_rgba(124,58,237,0.5)]"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleBuy}
                                disabled={isPending || isConfirming || !isConnected}
                                className={cn(
                                    "w-full py-5 mt-6 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]",
                                    !isConnected ? 'bg-white/10 text-white cursor-not-allowed' :
                                        tradeType === 'buy' ? 'bg-accent text-white shadow-accent/20 hover:bg-accent-dim' : 'bg-danger text-white shadow-danger/20 hover:bg-red-600'
                                )}
                            >
                                {isPending ? 'Confirming...' : !isConnected ? 'Connect Wallet' : `Execute ${tradeType}`}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

// --- SUB COMPONENTS ---

function Stat({ label, value, color = "text-white", indicator }: { label: string, value: string, color?: string, indicator?: boolean }) {
    return (
        <div className="text-right">
            <div className="text-[10px] text-text-dim uppercase tracking-wider mb-1 font-semibold">{label}</div>
            <div className="flex items-center justify-end gap-2">
                {indicator && <span className={`w-1.5 h-1.5 rounded-full animate-pulse bg-current ${color}`} />}
                <div className={`font-mono text-sm font-medium ${color}`}>{value}</div>
            </div>
        </div>
    )
}

function PanelHeader({ icon: Icon, title }: { icon: any, title: string }) {
    return (
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center gap-3">
            <Icon className="w-4 h-4 text-text-secondary" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">{title}</h2>
        </div>
    )
}

function TabButton({ active, onClick, label, icon: Icon }: { active: boolean, onClick: () => void, label: string, icon: any }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 h-full px-1 border-b-2 transition-all text-xs font-bold uppercase tracking-wide",
                active ? "border-white text-white" : "border-transparent text-text-dim hover:text-white"
            )}
        >
            <Icon className="w-4 h-4" /> {label}
        </button>
    )
}

function TradeTab({ active, onClick, label, type }: { active: boolean, onClick: () => void, label: string, type: 'buy' | 'sell' }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                active
                    ? (type === 'buy' ? 'bg-accent text-white shadow-lg' : 'bg-danger text-white shadow-lg')
                    : 'text-text-dim hover:text-white'
            )}
        >
            {label}
        </button>
    )
}

function AmountInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
    return (
        <div className="relative group">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[#050505] border border-white/10 rounded-2xl py-4 px-5 text-white font-mono text-lg focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-dim/30 group-hover:border-white/20"
                placeholder="0.0"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-text-dim font-mono pointer-events-none">BNB</div>
            <Wallet className="absolute right-14 top-1/2 -translate-y-1/2 text-text-dim/20 w-4 h-4 pointer-events-none" />
        </div>
    )
}

function QuickAmount({ value, onClick }: { value: string, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="flex-1 py-2 rounded-xl border border-white/10 bg-white/5 text-[10px] font-mono text-text-dim hover:text-white hover:border-white/30 hover:bg-white/10 transition-all active:scale-95"
        >
            {value}
        </button>
    )
}

function LogEntry({ type, msg, timestamp }: { type: string, msg: string, timestamp?: number }) {
    const colors: Record<string, string> = {
        INFO: 'text-text-dim',
        TEE: 'text-accent',
        NET: 'text-blue-400',
        EXEC: 'text-success',
        SKILL: 'text-purple-400',
        THOUGHT: 'text-yellow-400',
        POST: 'text-green-400',
        ERROR: 'text-red-500'
    }
    const timeStr = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour12: false }) : new Date().toLocaleTimeString([], { hour12: false });

    return (
        <div className="flex gap-3 text-[10px]">
            <span className="text-text-dim/30 w-12 shrink-0">{timeStr}</span>
            <span className={`${colors[type] || 'text-white'} font-bold w-12 shrink-0`}>[{type}]</span>
            <span className="text-white/60 font-medium">{msg}</span>
        </div>
    )
}

// Live Social Feed & Logs Hook
function SocialFeed({ ticker, agentId, setLogs }: { ticker: string, agentId?: string, setLogs: (logs: any[]) => void }) {
    const [tweets, setTweets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!agentId) return;

        const fetchData = async () => {
            try {
                // Fetch Tweets
                const resTweets = await fetch(`/api/agents/${agentId}/tweets`);
                if (resTweets.ok) {
                    const data = await resTweets.json();
                    setTweets(data);
                }

                // Fetch Logs (and lift up to parent for Terminal)
                const resLogs = await fetch(`/api/agents/${agentId}/logs`);
                if (resLogs.ok) {
                    const data = await resLogs.json();
                    setLogs(data);
                }
            } catch (e) {
                console.error("Polling error", e);
            } finally {
                setLoading(false);
            }
        }

        fetchData(); // Initial
        const interval = setInterval(fetchData, 5000); // Poll every 5s

        return () => clearInterval(interval);
    }, [agentId])

    if (tweets.length === 0 && !loading) return <div className="p-8 text-center text-text-dim text-xs">Processing initial thought stream...</div>

    return (
        <div className="space-y-0 relative">
            {/* Timeline Line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-[1px] bg-white/5" />

            {tweets.map((tweet, i) => (
                <div key={tweet.id || i} className="group relative pl-12 pr-6 py-4 hover:bg-white/[0.02] transition-colors border-b border-white/[0.02]">
                    <div className="absolute left-[20px] top-6 w-[7px] h-[7px] rounded-full bg-[#1A1A1A] border border-white/20 group-hover:border-accent group-hover:bg-accent transition-colors z-10" />

                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-accent/70 group-hover:text-accent font-bold">AGENT_{ticker}_{tweet.id?.substring(0, 4)}</span>
                        <span className="text-[9px] text-text-dim">{new Date(tweet.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-text-secondary font-light leading-relaxed">
                        {tweet.content}
                    </p>
                    {tweet.image && (
                        <div className="mt-3 rounded-lg overflow-hidden border border-white/10">
                            <img src={`data:image/png;base64,${tweet.image.replace('data:image/png;base64,', '')}`} alt="Agent View" className="w-full h-auto opacity-80" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}

// Utility
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
