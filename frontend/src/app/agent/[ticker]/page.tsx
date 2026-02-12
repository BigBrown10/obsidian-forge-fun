'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI } from '../../../lib/contracts'
import { getAgentByTicker, Agent } from '../../../lib/api'
import { MOCK_COMMENTS, formatMarketCap } from '../../../data/mock'
import ManageAgent from './manage'

export default function AgentDetail({ params }: { params: Promise<{ ticker: string }> }) {
    const [resolvedParams, setResolvedParams] = useState<{ ticker: string } | null>(null)
    const [agent, setAgent] = useState<Agent | null>(null)
    const [loading, setLoading] = useState(true)
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState('')
    const [activeTab, setActiveTab] = useState<'chart' | 'manage'>('chart')

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
            getAgentByTicker(resolvedParams.ticker).then(data => {
                setAgent(data)
                setLoading(false)
            })
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
    if (!agent) return <div className="min-h-screen flex items-center justify-center text-text-dim">Agent not found</div>

    const isCreator = isConnected && agent && address && agent.creator.toLowerCase() === address.toLowerCase()

    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden flex flex-col bg-base">
            {/* Header / Stats Bar */}
            <div className="h-16 border-b border-border-subtle bg-surface/50 backdrop-blur-md flex items-center px-6 justify-between shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-text-dim hover:text-white transition-colors">
                        ← Back
                    </Link>
                    <div className="h-8 w-[1px] bg-border-subtle mx-2" />
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg font-bold text-black shadow-glow"
                            style={{ background: '#7c3aed' }}
                        >
                            {agent.ticker.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-lg font-bold leading-none text-white">{agent.name}</h1>
                            <span className="text-xs text-text-dim font-mono tracking-wider">${agent.ticker}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Market Cap</div>
                        <div className="font-mono text-sm text-white">{formatMarketCap(0)}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Bonding</div>
                        <div className="font-mono text-sm text-accent">{agent.bondingProgress.toFixed(1)}%</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] text-text-dim uppercase tracking-wider mb-0.5">Status</div>
                        <div className="flex items-center justify-end gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
                            <span className="text-xs text-success font-medium">Live</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3-Panel Layout (Glass Command) */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0">

                {/* LEFT: Thought Stream (Logic) */}
                <div className="lg:col-span-3 border-r border-border-subtle bg-surface/30 flex flex-col min-h-0 relative">
                    <div className="p-4 border-b border-border-subtle bg-surface/80 backdrop-blur sticky top-0 z-10">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                            Thought Stream
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 relative">
                        <div className="scanline-overlay" />
                        <SocialFeed ticker={agent.ticker} />
                    </div>
                </div>

                {/* CENTER: Visuals & Data */}
                <div className="lg:col-span-6 flex flex-col min-h-0 relative bg-base">
                    {/* Toolbar */}
                    <div className="h-10 border-b border-border-subtle flex items-center px-4 gap-4 bg-surface/20">
                        <button
                            onClick={() => setActiveTab('chart')}
                            className={`text-xs font-medium h-full border-b-2 px-2 transition-colors ${activeTab === 'chart' ? 'border-accent text-white' : 'border-transparent text-text-dim hover:text-text-secondary'}`}
                        >
                            Price Chart
                        </button>
                        {isCreator && (
                            <button
                                onClick={() => setActiveTab('manage')}
                                className={`text-xs font-medium h-full border-b-2 px-2 transition-colors ${activeTab === 'manage' ? 'border-accent text-white' : 'border-transparent text-text-dim hover:text-text-secondary'}`}
                            >
                                Manage Agent ⚙️
                            </button>
                        )}
                        <span className="ml-auto text-[10px] text-text-dim font-mono">LIVE_FEED_V1.2</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-0 relative">
                        {activeTab === 'manage' ? (
                            <div className="p-6">
                                <ManageAgent agent={agent} />
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                {/* Chart Area */}
                                <div className="flex-1 bg-[url('/grid.png')] bg-repeat opacity-50 relative flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-4xl mb-4 opacity-20">📊</div>
                                        <div className="text-text-dim text-sm tracking-widest">TRADINGVIEW UPLINK...</div>
                                    </div>
                                    {/* Mock Graph Lines */}
                                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0,300 Q100,250 200,300 T400,200 T600,250 T800,100" fill="none" stroke="#7c3aed" strokeWidth="2" />
                                    </svg>
                                </div>
                                {/* Terminal Logs (Mock) */}
                                <div className="h-1/3 border-t border-border-subtle bg-surface p-4 font-mono text-xs overflow-y-auto">
                                    <h3 className="text-text-dim uppercase mb-2 text-[10px] tracking-widest border-b border-border-subtle pb-1 w-max">System Logs</h3>
                                    <div className="space-y-1 text-text-secondary">
                                        <div className="flex gap-2"><span className="text-text-dim">{new Date().toLocaleTimeString()}</span> <span className="text-success">[OK]</span> Connection established to BSC Testnet Node.</div>
                                        <div className="flex gap-2"><span className="text-text-dim">{new Date().toLocaleTimeString()}</span> <span className="text-accent">[TEE]</span> Quote verified for epoch #2938.</div>
                                        <div className="flex gap-2"><span className="text-text-dim">{new Date().toLocaleTimeString()}</span> <span className="text-blue-400">[NET]</span> Syncing mempool...</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RIGHT: Command (Trade & Gov) */}
                <div className="lg:col-span-3 border-l border-border-subtle bg-surface/30 flex flex-col min-h-0">
                    <div className="p-4 border-b border-border-subtle bg-surface/80 backdrop-blur">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                            Command Center
                        </h2>
                    </div>

                    <div className="p-5 space-y-6 overflow-y-auto flex-1">
                        {/* Trade Module */}
                        <div className="space-y-4">
                            <div className="flex gap-1 p-1 rounded-lg bg-black/50 border border-border-subtle">
                                <button
                                    onClick={() => setTradeType('buy')}
                                    className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${tradeType === 'buy' ? 'bg-accent text-black shadow-glow' : 'text-text-dim hover:text-white'}`}
                                >
                                    Buy
                                </button>
                                <button
                                    onClick={() => setTradeType('sell')}
                                    className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${tradeType === 'sell' ? 'bg-danger text-white shadow-glow-red' : 'text-text-dim hover:text-white'}`}
                                >
                                    Sell
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-text-dim font-bold tracking-widest">Amount (BNB)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-surface border border-border-subtle rounded-lg py-3 px-4 text-white font-mono text-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all placeholder:text-text-dim/50"
                                        placeholder="0.0"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-dim font-mono">BNB</div>
                                </div>
                                <div className="flex gap-2">
                                    {['0.1', '0.5', '1.0'].map((val) => (
                                        <button
                                            key={val}
                                            onClick={() => setAmount(val)}
                                            className="px-2 py-1 rounded border border-border-subtle text-[10px] font-mono text-text-dim hover:text-white hover:border-accent transition-colors"
                                        >
                                            {val}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bonding Curve Mini */}
                            <div className="space-y-2 pt-4 border-t border-border-subtle/50">
                                <div className="flex justify-between text-[10px] uppercase text-text-dim">
                                    <span>Bonding Progress</span>
                                    <span className="text-white">{agent.bondingProgress.toFixed(1)}%</span>
                                </div>
                                <div className="spark-meter h-2">
                                    <div className="spark-fill" style={{ width: `${agent.bondingProgress}%` }} />
                                </div>
                            </div>

                            <button
                                onClick={handleBuy}
                                disabled={isPending || isConfirming || !isConnected}
                                className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] ${!isConnected ? 'bg-white/10 text-white' :
                                        tradeType === 'buy' ? 'bg-accent text-black shadow-glow' : 'bg-danger text-white'
                                    }`}
                            >
                                {isPending ? 'Confirming...' : !isConnected ? 'Connect Wallet' : `${tradeType === 'buy' ? 'Execute Buy' : 'Execute Sell'}`}
                            </button>

                            {isSuccess && (
                                <div className="text-[10px] text-accent text-center font-mono animate-pulse">
                                    Tx Confirmed: {hash?.slice(0, 8)}...
                                </div>
                            )}
                        </div>

                        {/* Governance (Mock) */}
                        <div className="pt-6 border-t border-border-subtle">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Governance</h3>
                                <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                            </div>
                            <div className="bg-surface/50 rounded-lg p-3 border border-border-subtle/50">
                                <div className="text-xs text-text-dim mb-2">Active Proposal</div>
                                <div className="text-sm text-white font-medium mb-3">Vote to enable "Degen Mode"</div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 rounded bg-success/10 text-success text-xs font-bold border border-success/20 hover:bg-success/20">YES (92%)</button>
                                    <button className="flex-1 py-1.5 rounded bg-white/5 text-text-dim text-xs font-bold border border-white/10 hover:bg-white/10">NO (8%)</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function SocialFeed({ ticker }: { ticker: string }) {
    const [tweets, setTweets] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchTweets = async () => {
            try {
                // In production, use env var for API URL
                const res = await fetch(`http://localhost:3000/api/agents/${ticker}/tweets`)
                if (res.ok) {
                    const data = await res.json()
                    setTweets(data)
                }
            } catch (e) {
                console.error('Failed to fetch tweets:', e)
            } finally {
                setLoading(false)
            }
        }

        fetchTweets()
        const interval = setInterval(fetchTweets, 5000)
        return () => clearInterval(interval)
    }, [ticker])

    if (loading && tweets.length === 0) return <div className="text-center py-10 text-text-dim text-xs animate-pulse opacity-50">Reading Neural Stream...</div>

    if (tweets.length === 0) return (
        <div className="flex flex-col items-center justify-center h-40 text-text-dim opacity-50">
            <div className="text-2xl mb-2 grayscale">💤</div>
            <div className="text-xs font-mono uppercase">Neural Idle</div>
        </div>
    )

    return (
        <div className="space-y-4">
            {tweets.map((t) => (
                <div key={t.id} className="group relative pl-4 border-l border-border-subtle hover:border-accent/50 transition-colors">
                    <div className="absolute -left-[3px] top-0 w-[5px] h-[5px] rounded-full bg-border-subtle group-hover:bg-accent transition-colors" />

                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono text-accent">{new Date(t.timestamp).toLocaleTimeString()}</span>
                        <span className="text-[8px] uppercase tracking-wider text-text-dim border border-border-subtle px-1 rounded">Thinking</span>
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed bg-surface/50 p-2 rounded-lg border border-transparent group-hover:border-border-subtle/50 transition-all font-mono">
                        {t.content}
                    </p>

                    {/* Attached Image */}
                    {t.image && (
                        <div className="mt-2 rounded overflow-hidden border border-border-subtle group-hover:border-accent/30 transition-colors">
                            <img src={t.image} alt="Agent View" className="w-full h-auto opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="bg-black/80 p-1 text-[8px] text-text-dim font-mono flex justify-between">
                                <span>VISUAL_CORTEX_DUMP</span>
                                <span>720p</span>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
