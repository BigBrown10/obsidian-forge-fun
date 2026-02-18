'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi'
import { parseEther, formatEther, erc20Abi } from 'viem'
import { LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI, ROUTER_ADDRESS, ROUTER_ABI } from '../../../lib/contracts'
import { getAgentByTicker, type Agent } from '../../../lib/api'
import { formatMarketCap } from '../../../data/mock'
import ManageAgent from './manage'
import AgentActivityLog from '../../../components/AgentActivityLog'
import { ChevronLeft, Brain, Activity, Gavel, Wallet, Terminal, Zap, Users, Rocket, Lock, Shield, BarChart3, MessageSquare } from 'lucide-react'
import { formatCompactNumber } from '../../../lib/formatting'

export default function AgentDetail({ params }: { params: Promise<{ ticker: string }> }) {
    const [resolvedParams, setResolvedParams] = useState<{ ticker: string } | null>(null)
    const [agent, setAgent] = useState<Agent | null>(null)
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState<any[]>([])

    // Wagmi
    const { isConnected, address } = useAccount()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()

    useEffect(() => { params.then(setResolvedParams) }, [params])

    // Derived State
    const isCreator = agent && address ? agent.creator.toLowerCase() === address.toLowerCase() : false

    useEffect(() => {
        if (resolvedParams) {

            let retries = 0
            const maxRetries = 15
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
                            setLoading(false)
                        }
                    })
                    .catch(() => {
                        if (retries < maxRetries) { retries++; setTimeout(fetchAgent, 2000) }
                        else setLoading(false)
                    })
            }
            fetchAgent()
        }
    }, [resolvedParams])

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
            <div className="text-text-dim text-sm font-mono tracking-widest uppercase">Establishing Uplink...</div>
        </div>
    )

    if (!agent) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-text-dim space-y-4">
            <div className="text-xl font-bold text-white">Signal Lost</div>
            <p className="text-sm max-w-md text-center">The requested agent uplink could not be established.</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 flex items-center gap-2">
                <Zap className="w-4 h-4 text-accent" /> Retry Connection
            </button>
        </div>
    )

    // STRICT SEPARATION OF VIEWS
    // PUMP.FUN MODEL: All agents are "Live" (Tradable) immediately on creation.
    // "Incubator" is just the bonding curve phase.
    const isLive = true

    return <LiveTradingView agent={agent} logs={logs} setLogs={setLogs} isCreator={isCreator} />
}

// ----------------------------------------------------------------------
// 1. LIVE TRADING VIEW (Live View)
// ----------------------------------------------------------------------
// ... imports
import TradingChart from '../../../components/TradingChart'
import ChatBox from '../../../components/ChatBox'


// ... existing code ...

function LiveTradingView({ agent, logs, setLogs, isCreator }: { agent: Agent, logs: any[], setLogs: (l: any[]) => void, isCreator: boolean }) {
    const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy')
    const [amount, setAmount] = useState('')

    // Wagmi
    const { address } = useAccount()
    const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    const handleSwap = async () => {
        if (!amount || !address) return;
        const parsedAmount = parseEther(amount);
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20); // 20 mins

        if (tradeType === 'buy') {
            writeContract({
                address: ROUTER_ADDRESS,
                abi: ROUTER_ABI,
                functionName: 'swapExactETHForTokens',
                args: [
                    BigInt(0), // amountOutMin (slippage ignored for MVP)
                    ['0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' as `0x${string}`, agent.tokenAddress as `0x${string}`], // WBNB -> Token
                    address,
                    deadline
                ],
                value: parsedAmount
            });
        } else {
            // Sell Logic
            // We assume user has clicked 'Approve' if needed.
            writeContract({
                address: ROUTER_ADDRESS,
                abi: ROUTER_ABI,
                functionName: 'swapExactTokensForETH',
                args: [
                    parsedAmount,
                    BigInt(0),
                    [agent.tokenAddress as `0x${string}`, '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' as `0x${string}`],
                    address,
                    deadline
                ]
            })
        }
    }

    return (
        <div className="h-[calc(100vh-32px)] flex flex-col gap-4 overflow-hidden max-w-[1920px] mx-auto p-4">
            {/* Header */}
            <header className="h-16 shrink-0 flex items-center justify-between px-6 bg-surface/80 border border-white/5 rounded-2xl backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-lg text-text-dim hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-accent/20 flex items-center justify-center text-accent font-bold">
                            {agent.ticker[0]}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold leading-none text-white tracking-tight">{agent.name}</h1>
                                {agent.identity && (
                                    <div className="flex items-center gap-4 ml-4 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-blue-400" />
                                            <span className="text-xs text-blue-400 font-bold">@{agent.identity.username}</span>
                                        </div>
                                        <div className="w-px h-3 bg-white/10" />
                                        <div className="flex items-center gap-1.5 text-xs text-text-dim">
                                            <Shield className="w-3 h-3 text-success" />
                                            <span>Verified</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-accent font-mono tracking-wider bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">${agent.ticker}</span>
                                {isCreator && <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">CREATOR_MODE</span>}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-8 text-xs font-mono">
                    <div>
                        <div className="text-text-dim">PRICE</div>
                        <div className="text-white font-bold">$0.00042</div>
                    </div>
                    <div>
                        <div className="text-text-dim">MKT CAP</div>
                        <div className="text-white font-bold">$420k</div>
                    </div>
                </div>
            </header>

            {/* Trading Grid */}
            <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
                {/* LEFT: Chart (8 cols) */}
                <div className="col-span-8 bg-[#0A0A0B] rounded-2xl border border-white/5 overflow-hidden flex flex-col relative">
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <div className="bg-white/10 backdrop-blur px-2 py-1 rounded text-[10px] text-white font-mono">15m</div>
                        <div className="bg-transparent px-2 py-1 rounded text-[10px] text-text-dim font-mono hover:bg-white/5 cursor-pointer">1H</div>
                        <div className="bg-transparent px-2 py-1 rounded text-[10px] text-text-dim font-mono hover:bg-white/5 cursor-pointer">4H</div>
                    </div>



                    {/* Real Chart */}
                    <div className="h-[55%] relative border-b border-white/5">
                        <TradingChart data={[]} />
                    </div>

                    {/* Agent Activity Log (User requested 4x bigger, replacing ChatBox) */}
                    <div className="flex-1 bg-[#050505] flex flex-col min-h-0">
                        <AgentActivityLog agentId={agent.id} ticker={agent.ticker} />
                    </div>
                </div>

                {/* RIGHT: Order Form (4 cols) */}
                <div className="col-span-4 bg-surface/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">

                    {/* Tabs */}
                    <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-lg">
                        <button onClick={() => setTradeType('buy')} className={`py-2 text-xs font-bold uppercase rounded ${tradeType === 'buy' ? 'bg-success text-black' : 'text-text-dim hover:text-white'}`}>Buy</button>
                        <button onClick={() => setTradeType('sell')} className={`py-2 text-xs font-bold uppercase rounded ${tradeType === 'sell' ? 'bg-danger text-black' : 'text-text-dim hover:text-white'}`}>Sell</button>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4 flex-1">
                        <div className="relative">
                            <div className="text-[10px] text-text-dim uppercase mb-1 flex justify-between">
                                <span>Amount ({agent.ticker})</span>
                                <span>Bal: 0.00</span>
                            </div>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-white/30 outline-none"
                            />
                        </div>

                        {/* Quick Buy Buttons */}
                        <div className="grid grid-cols-4 gap-2">
                            {['0.1', '0.5', '1.0', '5.0'].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setAmount(val)}
                                    className="py-2.5 rounded-lg bg-white/5 text-xs font-mono text-text-dim hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-2">
                        {tradeType === 'sell' && (
                            <button
                                onClick={() => {
                                    if (!amount) return;
                                    writeContract({
                                        address: agent.tokenAddress as `0x${string}`,
                                        abi: erc20Abi,
                                        functionName: 'approve',
                                        args: [ROUTER_ADDRESS, parseEther(amount)]
                                    })
                                }}
                                className="w-1/3 py-4 rounded-xl font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 transition-colors shadow-lg"
                            >
                                Approve
                            </button>
                        )}
                        <button
                            onClick={handleSwap}
                            disabled={isPending || isConfirming}
                            className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-wider ${tradeType === 'buy' ? 'bg-success text-black hover:bg-green-400' : 'bg-danger text-black hover:bg-red-500'} transition-colors shadow-lg disabled:opacity-50`}
                        >
                            {isPending ? 'Tx Pending...' : tradeType === 'buy' ? 'Buy Now' : 'Sell Now'}
                        </button>
                    </div>

                    {writeError && <div className="text-red-500 text-xs mt-2 text-center">{writeError.message}</div>}
                    {isSuccess && <div className="text-green-500 text-xs mt-2 text-center">Swap Successful!</div>}

                    {/* Order Book Mock */}
                    <div className="mt-4 border-t border-white/5 pt-4">
                        <div className="text-[10px] text-text-dim uppercase mb-2">Order Book</div>
                        <div className="space-y-1 font-mono text-[10px]">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between text-danger/70">
                                    <span>{(0.00045 + (i * 0.00001)).toFixed(5)}</span>
                                    <span>{(1000 + i * 500).toFixed(0)}</span>
                                </div>
                            ))}
                            <div className="text-white font-bold my-1 text-center bg-white/5 py-1">0.00042</div>
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="flex justify-between text-success/70">
                                    <span>{(0.00041 - (i * 0.00001)).toFixed(5)}</span>
                                    <span>{(2000 + i * 300).toFixed(0)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
// 2. ICO / LAUNCHPAD VIEW (Incubation)
// ----------------------------------------------------------------------
function ICOLaunchView({ agent }: { agent: Agent }) {
    const [amount, setAmount] = useState('')
    const { isConnected } = useAccount()
    const { switchChain } = useSwitchChain()
    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
    const chainId = useChainId()

    const handlePledge = () => {
        if (!isConnected) return alert('Connect Wallet')
        if (chainId !== 97) return switchChain({ chainId: 97 })
        if (!amount) return

        writeContract({
            address: LAUNCHPAD_ADDRESS,
            abi: LAUNCHPAD_ABI,
            functionName: 'pledge',
            args: [BigInt(agent.id)],
            value: parseEther(amount)
        })
    }

    const metadata = agent.metadataURI ? JSON.parse(agent.metadataURI) : {}
    const progress = Math.min(agent.bondingProgress, 100)

    return (
        <div className="min-h-screen py-12 px-4 flex justify-center items-start">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-purple-900/10 pointer-events-none" />

            <div className="w-full max-w-5xl z-10 grid grid-cols-1 md:grid-cols-2 gap-12">

                {/* LEFT: Project Info */}
                <div className="space-y-8">
                    <Link href="/launchpad" className="text-text-dim hover:text-white flex items-center gap-2 text-sm transition-colors mb-8">
                        <ChevronLeft className="w-4 h-4" /> Back to Launchpad
                    </Link>

                    <div className="w-48 h-48 rounded-3xl overflow-hidden border border-white/20 shadow-2xl shrink-0 bg-black/20">
                        <img src={metadata.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${agent.ticker}`} className="w-full h-full object-cover" />
                    </div>

                    <div>
                        <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">{agent.name}</h1>
                        <div className="flex items-center gap-4 text-lg text-text-secondary">
                            <span className="font-mono text-accent">${agent.ticker}</span>
                            <span className="flex items-center gap-1 text-xs bg-white/5 rounded-full px-3 py-1 text-text-dim border border-white/5">
                                <Rocket className="w-3 h-3" /> Incubating
                            </span>
                        </div>
                    </div>

                    <div className="prose prose-invert prose-sm text-text-secondary/80 leading-relaxed font-light">
                        <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-4">Manifesto</h3>
                        <p>{metadata.description || "No manifesto provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-xs text-text-dim uppercase mb-1">Target Raise</div>
                            <div className="text-xl font-mono text-white">{formatCompactNumber(Number(agent.targetAmount))} BNB</div>
                        </div>
                        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="text-xs text-text-dim uppercase mb-1">Min Pledge</div>
                            <div className="text-xl font-mono text-white">0.01 BNB</div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Participation Card */}
                <div className="bg-surface border border-white/10 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-accent/10 blur-[80px] rounded-full pointer-events-none" />

                    <h2 className="text-2xl font-bold text-white mb-6">Participate in Presale</h2>

                    <div className="mb-8">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-text-dim">Funding Progress</span>
                            <span className="text-white font-mono">{progress.toFixed(2)}%</span>
                        </div>
                        <div className="h-4 w-full bg-[#0A0A0B] rounded-full overflow-hidden border border-white/5">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-accent to-purple-400"
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-text-dim mt-2">
                            <span>0 BNB</span>
                            <span>{formatCompactNumber(Number(agent.targetAmount))} BNB</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                placeholder="0.0"
                                className="w-full bg-[#0A0A0B] border border-white/10 focus:border-accent rounded-xl py-4 px-4 text-2xl text-white font-mono outline-none transition-colors"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim font-bold">BNB</div>
                        </div>
                        <div className="flex gap-2">
                            {['0.1', '0.5', '1.0', '5.0'].map(val => (
                                <button key={val} onClick={() => setAmount(val)} className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-text-dim transition-colors">
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handlePledge}
                        disabled={!isConnected || isPending || isConfirming}
                        className="w-full py-5 rounded-2xl bg-white text-black font-bold text-lg hover:bg-gray-200 transition-all shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] disabled:opacity-50"
                    >
                        {isPending ? 'Confirming...' : 'Pledge BNB'}
                    </button>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-text-dim">
                        <Shield className="w-3 h-3" />
                        <span>Secure TEE Enclave Verification</span>
                    </div>
                </div>

            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
// HELPERS
// ----------------------------------------------------------------------
function SocialFeed({ ticker, agentId, setLogs }: { ticker: string, agentId?: string, setLogs: (logs: any[]) => void }) {
    const [tweets, setTweets] = useState<any[]>([])
    useEffect(() => {
        if (!agentId) return;
        const fetchData = async () => {
            try {
                // Fetch Tweets
                const resTweets = await fetch(`/api/agents/${agentId}/tweets`);
                if (resTweets.ok) setTweets(await resTweets.json());
                // Fetch Logs
                const resLogs = await fetch(`/api/agents/${agentId}/logs`);
                if (resLogs.ok) setLogs(await resLogs.json());
            } catch (e) {
                console.error("Polling error", e);
            }
        }
        fetchData();
        const interval = setInterval(fetchData, 2000); // 2s polling
        return () => clearInterval(interval);
    }, [agentId])

    if (tweets.length === 0) return <div className="p-4 text-text-dim/30">Connecting to stream...</div>

    return (
        <div className="space-y-1">
            {tweets.map((tweet, i) => (
                <div key={i} className="flex gap-2 text-text-secondary/80">
                    <span className="text-text-dim shrink-0">{new Date(tweet.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                    <span className="text-accent font-bold shrink-0">LOG</span>
                    <span className="truncate">{tweet.content}</span>
                </div>
            ))}
        </div>
    )
}
