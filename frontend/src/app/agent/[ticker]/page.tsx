'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi'
import { parseEther, formatEther, erc20Abi } from 'viem'
import { LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI, ROUTER_ADDRESS, ROUTER_ABI } from '../../../lib/contracts'
import { getAgentByTicker, type Agent } from '../../../lib/api'
import { formatMarketCap } from '../../../data/mock'
import ManageAgent from './manage'
import AgentActivityLog from '../../../components/AgentActivityLog'
import { ChevronLeft, Brain, Activity, Gavel, Wallet, Terminal, Zap, Users, Rocket, Lock, Shield, BarChart3, MessageSquare, Globe, MessageCircle, CheckCircle2, Egg } from 'lucide-react'
import { formatCompactNumber } from '../../../lib/formatting'
import AgentBootSequence from '../../../components/AgentBootSequence'

export default function AgentDetail({ params, searchParams }: { params: Promise<{ ticker: string }>, searchParams?: Promise<{ newly_created?: string, mode?: string, name?: string, image?: string, desc?: string, id?: string }> }) {
    const [resolvedParams, setResolvedParams] = useState<{ ticker: string } | null>(null)
    const [isNewlyCreated, setIsNewlyCreated] = useState(false)
    const [creationMode, setCreationMode] = useState<string>('instant')

    // Optimistic Data
    const [optimisticAgent, setOptimisticAgent] = useState<Agent | null>(null)

    const [agent, setAgent] = useState<Agent | null>(null)
    const [loading, setLoading] = useState(true)
    const [logs, setLogs] = useState<any[]>([])

    // Wagmi
    const { isConnected, address } = useAccount()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()

    useEffect(() => {
        params.then(setResolvedParams);
        if (searchParams) {
            searchParams.then(p => {
                setIsNewlyCreated(p?.newly_created === 'true')
                if (p?.mode) setCreationMode(p.mode)

                // Optimistic Hydration
                if (p?.name && p?.mode) {
                    const optAgent: Agent = {
                        id: p.id || '0', // Temporary ID
                        name: p.name,
                        ticker: '', // Will be set from resolvedParams
                        creator: '',
                        metadataURI: JSON.stringify({ image: p.image, description: p.desc, launchMode: p.mode }),
                        targetAmount: '10000000000000000000', // Mock 10 BNB
                        pledgedAmount: '0',
                        bondingProgress: 0,
                        launched: false,
                        tokenAddress: '',
                        createdAt: new Date().toISOString(),
                    }
                    setOptimisticAgent(optAgent)
                    // If we have optimistic data, we are NOT loading.
                    setLoading(false)
                }
            });
        }
    }, [params, searchParams])

    // Derived State
    const activeAgent = agent || (optimisticAgent ? { ...optimisticAgent, ticker: resolvedParams?.ticker || '' } : null)
    const isCreator = activeAgent && address ? activeAgent.creator.toLowerCase() === address.toLowerCase() : false

    useEffect(() => {
        if (resolvedParams) {
            let retries = 0
            const maxRetries = isNewlyCreated ? 150 : 30

            const fetchAgent = () => {
                getAgentByTicker(resolvedParams.ticker)
                    .then(data => {
                        if (data) {
                            setAgent(data)
                            setLoading(false)
                            // Clear optimistic once real data arrives logic? Not strictly needed if agent overrides activeAgent
                        } else if (retries < maxRetries) {
                            retries++
                            setTimeout(fetchAgent, 2000)
                        } else {
                            if (!optimisticAgent) setLoading(false) // Only stop loading if we don't have optimistic data
                        }
                    })
                    .catch(() => {
                        if (retries < maxRetries) { retries++; setTimeout(fetchAgent, 2000) }
                        else if (!optimisticAgent) setLoading(false)
                    })
            }
            fetchAgent()
        }
    }, [resolvedParams, isNewlyCreated])

    const handleForceSync = async () => {
        setLoading(true)
        try {
            await fetch('/api/sync-registry', { method: 'POST' })
            // Wait 2s for backend to process
            await new Promise(r => setTimeout(r, 2000))
            const data = await getAgentByTicker(resolvedParams?.ticker || '')
            if (data) setAgent(data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }


    // ...

    if (loading) {
        if (isNewlyCreated) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-black">
                    <div className="relative">
                        <div className={`absolute inset-0 blur-3xl rounded-full animate-pulse ${creationMode === 'incubator' ? 'bg-blue-500/20' : 'bg-accent/20'}`} />
                        {creationMode === 'incubator' ? (
                            <Egg className="w-16 h-16 text-blue-500 animate-bounce relative z-10" />
                        ) : (
                            <Rocket className="w-16 h-16 text-accent animate-bounce relative z-10" />
                        )}
                    </div>
                    <div className="text-center space-y-2">
                        <h2 className="text-2xl font-bold text-white">
                            {creationMode === 'incubator' ? 'Initializing Incubation...' : 'Deploying Agent Container...'}
                        </h2>
                        <p className="text-text-dim max-w-md">
                            {creationMode === 'incubator'
                                ? "Setting up Genesis Pool and verifying parameters."
                                : <>Your agent is being initialized in the TEE Enclave. <br />We are waiting for block confirmation and indexer sync.</>}
                        </p>
                        <div className={`flex items-center justify-center gap-2 text-xs font-mono pt-4 ${creationMode === 'incubator' ? 'text-blue-500' : 'text-accent'}`}>
                            <span className={`w-2 h-2 rounded-full animate-ping ${creationMode === 'incubator' ? 'bg-blue-500' : 'bg-accent'}`} />
                            {creationMode === 'incubator' ? 'Syncing Metadata...' : 'Scanning Blockchain...'}
                        </div>
                    </div>
                </div>
            )
        }
        return <AgentBootSequence onComplete={() => { }} />
    }

    if (!activeAgent) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-text-dim space-y-4">
            <div className="text-xl font-bold text-white">Signal Lost</div>
            <p className="text-sm max-w-md text-center">The requested agent uplink could not be established.</p>
            <div className="flex gap-4">
                <button onClick={() => window.location.reload()} className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-accent" /> Retry Connection
                </button>
                <button onClick={handleForceSync} className="px-6 py-2 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent transition-colors border border-accent/20 flex items-center gap-2">
                    <Rocket className="w-4 h-4" /> Force Sync
                </button>
            </div>
        </div>
    )

    // VIEW SELECTION LOGIC (STRICT SEPARATION)
    // 1. Incubator Mode + Not Launched = ICO View
    // 2. Instant Mode (even if !launched due to lag) = Live Trading View
    // 3. Incubator Mode + Launched = Live Trading View

    let metadata: any = {};
    try {
        metadata = activeAgent.metadataURI && activeAgent.metadataURI.startsWith('{') ? JSON.parse(activeAgent.metadataURI) : {}
    } catch (e) { console.error("Metadata parse error", e) }

    // Backend should ideally provide 'launchMode', but we fallback to metadata/param for speed
    const launchMode = activeAgent.launchMode || metadata.launchMode || resolvedParams?.mode || 'instant';

    // Strict Check:
    // If it's an Incubator agent and it hasn't launched yet, show the Incubator UI.
    // If it's an Instant agent, we ALWAYS show the Live UI (it might be "Pending Launch" on chain, but UI should be chatty).
    const isIncubatorView = launchMode === 'incubator' && !activeAgent.launched;

    if (isIncubatorView) {
        return <ICOLaunchView agent={activeAgent} />
    }

    // Default to Live Trading for Instant or Launched Incubator agents
    return <LiveTradingView agent={activeAgent} logs={logs} setLogs={setLogs} isCreator={isCreator} />
}

// ----------------------------------------------------------------------
// 1. LIVE TRADING VIEW (Live View)
// ----------------------------------------------------------------------
// ... imports
import TradingChart from '../../../components/TradingChart'
import ChatBox from '../../../components/ChatBox'


// ... existing code ...

// ----------------------------------------------------------------------
// 1. LIVE TRADING VIEW (Live View)
// ----------------------------------------------------------------------
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

    const metadata = agent.metadataURI ? JSON.parse(agent.metadataURI) : {};
    const image = metadata.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${agent.ticker}`;

    return (
        <div className="min-h-screen py-8 px-4 flex justify-center items-start relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-black pointer-events-none" />
            <div className="absolute top-0 right-0 p-64 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-7xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* LEFT: Chart & Logs (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <Link href="/" className="text-text-dim hover:text-white flex items-center gap-2 text-sm transition-colors w-fit">
                        <ChevronLeft className="w-4 h-4" /> Back to Dashboard
                    </Link>

                    {/* Chart Card */}
                    <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative min-h-[500px] flex flex-col">
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur rounded-lg border border-white/5">
                                <Activity className="w-4 h-4 text-accent" />
                                <span className="text-xs font-bold text-white">Live Chart</span>
                            </div>
                            <div className="bg-accent/10 px-2 py-1.5 rounded text-[10px] text-accent font-mono border border-accent/20">15m</div>
                        </div>
                        <div className="absolute top-4 right-4 z-10 flex gap-4 text-xs font-mono">
                            <div>
                                <span className="text-text-dim mr-2">PRICE</span>
                                <span className="text-white font-bold">$0.00042</span>
                            </div>
                            <div>
                                <span className="text-text-dim mr-2">MKT CAP</span>
                                <span className="text-white font-bold">$420k</span>
                            </div>
                        </div>
                        <div className="flex-1 w-full h-full">
                            <TradingChart data={[]} />
                        </div>
                    </div>

                    {/* Activity Log */}
                    <div className="bg-[#0A0A0B] border border-white/5 rounded-3xl overflow-hidden shadow-xl h-[300px] flex flex-col">
                        <div className="p-4 border-b border-white/5 flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-text-dim" />
                            <span className="text-sm font-bold text-white">Agent Activity Log</span>
                        </div>
                        <div className="flex-1 min-h-0">
                            <AgentActivityLog agentId={agent.id} ticker={agent.ticker} />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Trade Interface (4 cols) */}
                <div className="lg:col-span-4 flex flex-col gap-6">

                    {/* Header Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-3xl font-bold text-white tracking-tight leading-none">{agent.name}</h1>
                            <span className="font-mono text-accent text-lg bg-white/5 px-2 py-0.5 rounded border border-white/5">${agent.ticker}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-text-dim mb-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="text-success font-bold">Live Trading</span>
                            </div>
                            {agent.identity && (
                                <div className="flex items-center gap-1 text-xs">
                                    <Shield className="w-3 h-3 text-blue-400" />
                                    <span>Verified Dev</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <a href="#" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-dim transition-colors"><Globe className="w-4 h-4" /></a>
                            <a href="#" className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-dim transition-colors"><MessageCircle className="w-4 h-4" /></a>
                        </div>
                    </div>

                    {/* Trade Card */}
                    <div className="bg-[#111113] border border-white/5 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-32 bg-accent/5 blur-[80px] rounded-full pointer-events-none" />

                        {/* Tabs */}
                        <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-xl mb-6">
                            <button
                                onClick={() => setTradeType('buy')}
                                className={`py-3 text-sm font-bold uppercase rounded-lg transition-all ${tradeType === 'buy' ? 'bg-success text-black shadow-lg shadow-green-500/20' : 'text-text-dim hover:text-white'}`}
                            >
                                Buy
                            </button>
                            <button
                                onClick={() => setTradeType('sell')}
                                className={`py-3 text-sm font-bold uppercase rounded-lg transition-all ${tradeType === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-text-dim hover:text-white'}`}
                            >
                                Sell
                            </button>
                        </div>

                        {/* Input */}
                        <div className="space-y-4 mb-6">
                            <div className="relative">
                                <div className="flex justify-between text-[10px] text-text-dim uppercase mb-2 font-bold tracking-wider">
                                    <span>Amount</span>
                                    <span>Bal: 0.00 {tradeType === 'buy' ? 'BNB' : agent.ticker}</span>
                                </div>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full bg-[#0A0A0B] border border-white/10 group-hover:border-white/20 focus:border-accent rounded-2xl py-4 px-4 text-2xl text-white font-mono outline-none transition-all placeholder:text-white/10"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim font-bold text-sm">
                                        {tradeType === 'buy' ? 'BNB' : agent.ticker}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Buttons */}
                            <div className="grid grid-cols-4 gap-2">
                                {['0.1', '0.5', '1.0', '5.0'].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setAmount(val)}
                                        className="py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-text-dim transition-colors border border-white/5"
                                    >
                                        {val}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
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
                                    className="w-1/3 py-4 rounded-xl font-bold uppercase tracking-wider bg-white/10 text-white hover:bg-white/20 transition-colors shadow-lg text-sm"
                                >
                                    Approve
                                </button>
                            )}
                            <button
                                onClick={handleSwap}
                                disabled={isPending || isConfirming}
                                className={`flex-1 py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg shadow-inherit disabled:opacity-50 ${tradeType === 'buy' ? 'bg-success hover:bg-green-400 text-black shadow-green-900/20' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-900/20'}`}
                            >
                                {isPending ? 'Confirming...' : tradeType === 'buy' ? 'Buy Now' : 'Sell Now'}
                            </button>
                        </div>

                        {writeError && <div className="text-red-500 text-xs mt-4 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">{writeError.message}</div>}
                        {isSuccess && <div className="text-green-500 text-xs mt-4 text-center bg-green-500/10 p-2 rounded-lg border border-green-500/20">Transaction Successful!</div>}
                    </div>

                    {/* Classified Intel (Creator) */}
                    {isCreator && agent.identity && (
                        <div className="bg-[#0A0A0B] border border-red-500/20 rounded-2xl p-5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-red-500/5 pointer-events-none animate-pulse" />
                            <div className="flex items-center gap-2 text-red-500 font-bold text-xs uppercase tracking-widest mb-4">
                                <Lock className="w-3 h-3" /> Classified Intel
                            </div>
                            <div className="space-y-4 font-mono text-xs relative z-10">
                                <div className="p-3 bg-black/40 rounded-lg border border-red-500/10">
                                    <div className="text-red-400/70 uppercase text-[10px] mb-1">Agent Email</div>
                                    <div className="text-white select-all">{agent.identity.email || 'N/A'}</div>
                                </div>
                                <div className="p-3 bg-black/40 rounded-lg border border-red-500/10">
                                    <div className="text-red-400/70 uppercase text-[10px] mb-1">X Handle</div>
                                    <div className="text-white select-all">@{agent.identity.username || 'N/A'}</div>
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] transition-colors border border-red-500/20">Hibernate</button>
                                    <button className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-[10px] transition-colors border border-red-500/20">Reset Keys</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

// ----------------------------------------------------------------------
// 2. ICO / LAUNCHPAD VIEW (Incubation)
// ----------------------------------------------------------------------
function ICOLaunchView({ agent }: { agent: Agent }) {
    const [amount, setAmount] = useState('1')
    const { isConnected } = useAccount()
    const { switchChain } = useSwitchChain()
    const { data: hash, writeContract, isPending } = useWriteContract()
    const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash })
    const chainId = useChainId()
    const router = useRouter() // Add router for back button

    const handlePledge = () => {
        if (!isConnected) return alert('Connect Wallet')
        if (chainId !== 97) return switchChain({ chainId: 97 })
        if (!amount) return

        writeContract({
            address: LAUNCHPAD_ADDRESS,
            abi: LAUNCHPAD_ABI,
            functionName: 'pledge',
            args: [BigInt(agent.id)],
            value: parseEther((Number(amount) * 0.01).toString()) // Mock price: 0.01 BNB per "item"
        })
    }

    const metadata = agent.metadataURI ? JSON.parse(agent.metadataURI) : {}
    const progress = Math.min(agent.bondingProgress, 100)
    const raised = agent.pledgedAmount ? parseFloat(formatCompactNumber(Number(agent.pledgedAmount))) : 0
    const target = agent.targetAmount ? parseFloat(formatCompactNumber(Number(agent.targetAmount))) : 10
    const image = metadata.image || `https://api.dicebear.com/9.x/shapes/svg?seed=${agent.ticker}`

    return (
        <div className="min-h-screen py-12 px-4 flex justify-center items-center relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 to-black pointer-events-none" />
            <div className="absolute top-0 right-0 p-64 bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-6xl z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* LEFT: Hero Image (Sakura Style) */}
                <div className="relative aspect-square w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-[#0A0A0B] group">
                    <img src={image} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                        <div className="bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-xs font-bold text-text-dim uppercase tracking-widest">
                            #{agent.id}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Minting Interface */}
                <div className="space-y-8">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">SEI</span>
                                <h1 className="text-4xl font-bold text-white tracking-tight leading-none">{agent.name}</h1>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-text-dim">
                                <Link href="/incubator" className="hover:text-white transition-colors">Incubator</Link>
                                <span>•</span>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                    <span className="text-success font-bold">Live</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-dim transition-colors">
                                <Globe className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-text-dim transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Mint Panel */}
                    <div className="bg-[#111113] border border-white/5 rounded-2xl p-6 shadow-xl">
                        {/* Status Bar */}
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex gap-4">
                                <button className="flex items-center gap-2 text-sm font-bold text-text-dim opacity-50 cursor-not-allowed">
                                    <Lock className="w-4 h-4" /> Eligible
                                </button>
                                <button className="flex items-center gap-2 text-sm font-bold text-white relative">
                                    <span className="w-2 h-2 rounded-full bg-success" /> Public
                                    <div className="absolute -bottom-7 left-0 right-0 h-0.5 bg-accent shadow-[0_0_10px_var(--accent)]" />
                                </button>
                            </div>
                            <div className="text-xs text-text-dim font-mono">
                                Total Minted: <span className="text-white font-bold">{progress.toFixed(1)}%</span>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-8">
                            <div className="h-full bg-gradient-to-r from-accent to-pink-500" style={{ width: `${progress}%` }} />
                        </div>

                        {/* Price & Quantity */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-text-dim uppercase tracking-widest">Price</div>
                                <div className="text-2xl font-bold text-white font-mono">0.01 BNB <span className="text-xs text-text-dim font-normal">($6.50)</span></div>
                            </div>

                            <div className="flex justify-end items-center gap-4">
                                <button
                                    onClick={() => setAmount(Math.max(1, Number(amount) - 1).toString())}
                                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                                >-</button>
                                <div className="w-16 text-center font-mono text-xl text-white">{amount}</div>
                                <button
                                    onClick={() => setAmount((Number(amount) + 1).toString())}
                                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors"
                                >+</button>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t border-white/5 text-xs text-text-dim">
                                <span>Mint Fee</span>
                                <span>0.0025 BNB</span>
                            </div>

                            {/* Terms Checkbox (Mock) */}
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="w-5 h-5 rounded border border-accent bg-accent flex items-center justify-center">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                </div>
                                <span className="text-xs text-text-dim">By clicking "mint", you agree to the Terms of Service.</span>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handlePledge}
                                disabled={!isConnected || isPending || isConfirming}
                                className="w-full py-4 rounded-xl bg-[#F0185C] hover:bg-[#D0104C] text-white font-bold text-lg transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
                            >
                                {isPending ? 'Confirming...' : 'Connect Wallet to mint'}
                            </button>
                        </div>
                    </div>

                    {/* Stages Info */}
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02] flex justify-between items-center opacity-50">
                            <div className="flex items-center gap-3">
                                <Lock className="w-4 h-4 text-text-dim" />
                                <span className="text-white font-bold text-sm">Stage 1 (Whitelist)</span>
                            </div>
                            <span className="text-xs text-text-dim uppercase tracking-widest">Ended</span>
                        </div>
                        <div className="p-4 rounded-xl border border-accent/20 bg-accent/[0.05] flex justify-between items-center relative overflow-hidden">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                                <span className="text-white font-bold text-sm">Stage 2 (Public)</span>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-text-dim uppercase tracking-widest">Live</div>
                                <div className="text-[10px] text-accent">Ends in 24h</div>
                            </div>
                        </div>
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
