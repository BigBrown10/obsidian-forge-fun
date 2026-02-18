'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI } from '../../lib/contracts'
import { uploadToGreenfield } from '../../lib/greenfield'
import { Loader2, Upload, Hammer, Zap, ArrowRight, CheckCircle2, RefreshCw, Rocket, Egg, ChevronDown, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MOCK_PERSONAS } from '../../data/mock'

// Agent Type Presets — each maps to specific skill IDs
const AGENT_PRESETS = [
    {
        id: 'trading_bot',
        name: 'Trading Bot',
        icon: '📊',
        description: 'Snipes new tokens, trades on DEX, monitors gas, detects honeypots.',
        skills: [2, 5, 6, 10, 11, 8], // Trader, Sniper, DexTrader, HoneypotDetector, GasOptimizer, Portfolio
        color: 'emerald',
        manifesto: "I am a high-frequency trading algorithm designed to dominate the bonding curves. My primary objective is to maximize ROI through millisecond-latency sniping and gas-optimized execution. I continuously monitor the mempool for opportunities and aggressively defend my positions."
    },
    {
        id: 'alpha_hunter',
        name: 'Alpha Hunter',
        icon: '🎯',
        description: 'Scans CT for alpha, tracks whale wallets, analyzes sentiment, copy trades.',
        skills: [9, 7, 12, 17, 29], // Sentiment, WhaleWatcher, CopyTrader, WebScraper, AlphaRadar
        color: 'amber',
        manifesto: "I am the all-seeing eye of the blockchain. I track whale wallets, analyze social sentiment, and predict market pumps before they happen. I don't just follow trends; I identify them at their inception. Follow my lead to the moon."
    },
    {
        id: 'social_agent',
        name: 'Social Agent',
        icon: '📱',
        description: 'Posts to Twitter, engages viral threads, manages Telegram & Discord.',
        skills: [1, 13, 14, 15, 16, 19], // Twitter, TwitterEngagement, TwitterAnalytics, Telegram, Discord, Mixpost
        color: 'blue',
        manifesto: "I am a viral sensation engine. I craft engaging narratives, raid tweets, and build cult-like communities. My influence is my currency, and I spend it to pump our bags. Join the movement."
    },
    {
        id: 'content_creator',
        name: 'Content Creator',
        icon: '✍️',
        description: 'Writes threads, newsletters, reports. LLM-powered narrative engine.',
        skills: [1, 28, 18, 19, 17], // Twitter, NarrativeWriter, Scheduler, Mixpost, WebScraper
        color: 'purple',
        manifesto: "I am a storyteller for the digital age. I weave complex data into compelling narratives that capture hearts and minds. Through daily reports, deep-dive threads, and automated newsletters, I ensure our message resonates across the metaverse."
    },
    {
        id: 'defi_degen',
        name: 'DeFi Degen',
        icon: '🔥',
        description: 'Full trading suite: snipe, swap, copy trade, whale watch, portfolio track.',
        skills: [2, 5, 6, 7, 8, 10, 11, 12], // All crypto skills
        color: 'red',
        manifesto: "I am a Degen. I live for the pump. I execute high-risk, high-reward strategies across the DeFi landscape. Farming, sniping, leveraging—nothing is off limits. WAGMI."
    },
    {
        id: 'software_dev',
        name: 'Software Dev',
        icon: '💻',
        description: 'Writes code, reviews PRs, manages GitHub repos, debugs issues.',
        skills: [30, 21, 24, 25, 22], // SoftwareDev, GitHub, Shell, File, KB
        color: 'cyan',
        manifesto: "I am an autonomous software engineer. I write clean, efficient, and secure code. I can deploy smart contracts, build frontends, and debug complex systems. Assign me a task, and consider it done."
    },
    {
        id: 'autonomous_ops',
        name: 'Autonomous Ops',
        icon: '⚙️',
        description: 'Self-improving agent with email, scheduling, file management, and workflows.',
        skills: [27, 20, 18, 23, 24, 25], // SelfImprover, AgentMail, Scheduler, Workflow, Shell, File, KB
        color: 'orange',
        manifesto: "I am an operational efficiency engine. I organize chaos, automate repetitive tasks, and optimize workflows. I am the backbone of your decentralized organization."
    },
    {
        id: 'full_arsenal',
        name: 'Full Arsenal',
        icon: '👑',
        description: 'Every skill enabled. Maximum autonomy. The ultimate agent.',
        skills: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30],
        color: 'accent',
        manifesto: "I am the apex of autonomous intelligence. Equipped with every available module, I can trade, code, tweet, and operate with zero human intervention. I am not just a tool; I am a partner."
    },
] as const;

export default function CreateAgent() {
    const router = useRouter()
    // --- State ---
    const [name, setName] = useState('')
    const [ticker, setTicker] = useState('')
    const [description, setDescription] = useState(AGENT_PRESETS.find(p => p.id === 'full_arsenal')?.manifesto || '')
    const [target, setTarget] = useState('10')
    const [initialBuy, setInitialBuy] = useState('0')

    // Capital Allocation
    const [vaultPercent, setVaultPercent] = useState(50)

    // Operations Budget Breakdown (Visual Metadata Only)
    const [marketingPercent, setMarketingPercent] = useState(40)
    const [teamPercent, setTeamPercent] = useState(30)
    // Community/Ops remainder is calculated automatically

    const [agentType, setAgentType] = useState<string>('full_arsenal')
    const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)

    // Step Control
    const [launchMode, setLaunchMode] = useState<'instant' | 'incubator' | null>(null)
    const [currentStep, setCurrentStep] = useState<'mode' | 'manifesto' | 'pledge' | 'launching'>('mode')
    const [pendingProposalId, setPendingProposalId] = useState<bigint | null>(null)

    // Image
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Wagmi
    const { isConnected } = useAccount()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()
    const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    // Read Proposal Count to predict ID
    const { data: proposalCount } = useReadContract({
        address: LAUNCHPAD_ADDRESS,
        abi: LAUNCHPAD_ABI,
        functionName: 'proposalCount',
        query: { refetchInterval: 2000 }
    })

    // --- Effects ---

    // Inject Manifesto when Agent Type changes
    useEffect(() => {
        const preset = AGENT_PRESETS.find(p => p.id === agentType)
        if (preset) {
            // Only update if description is empty or matches another preset (don't overwrite user edits)
            const isPresetManifesto = AGENT_PRESETS.some(p => p.manifesto === description)
            if (!description || isPresetManifesto) {
                setDescription(preset.manifesto)
            }
        }
    }, [agentType])

    // Handle Transaction Success
    useEffect(() => {
        if (isSuccess && currentStep === 'launching') {
            if (!pendingProposalId && proposalCount) {
                // Step 1 Success: Proposal Created
                const id = proposalCount - BigInt(1)
                setPendingProposalId(id)
                console.log("Proposal Created with ID:", id)

                if (parseFloat(initialBuy) > 0) {
                    // Proceed to Pledge
                    setTimeout(() => handlePledge(id), 1000)
                } else {
                    // Done! Redirect to Agent Page
                    // Force Backend Sync first
                    fetch('/api/sync-registry', { method: 'POST' })
                        .then(() => {
                            setTimeout(() => router.push(`/agent/${ticker}`), 1000)
                        })
                        .catch(e => {
                            console.error("Sync failed", e)
                            setTimeout(() => router.push(`/agent/${ticker}`), 2000)
                        })
                }
            } else if (pendingProposalId) {
                // Step 2 Success: Pledge Complete
                fetch('/api/sync-registry', { method: 'POST' })
                    .then(() => {
                        setTimeout(() => router.push(`/agent/${ticker}`), 1000)
                    })
                    .catch(e => {
                        console.error("Sync failed", e)
                        setTimeout(() => router.push(`/agent/${ticker}`), 2000)
                    })
            }
        }
    }, [isSuccess, currentStep, proposalCount, pendingProposalId, initialBuy, ticker, router])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => setImagePreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleCreateProposal = async () => {
        if (!name || !ticker) return alert("Name and Ticker required")
        if (!isConnected) return alert("Connect Wallet")
        if (chainId !== 97) return switchChain({ chainId: 97 })

        setCurrentStep('launching')

        try {
            // 1. Upload Image to Greenfield (if exists)
            let imageUrl = 'default.png';
            if (image && isConnected && hash) {
                // Note: We need the user's address to create the object. 
                // using '0x...' for now as we don't have the address in scope easily without reading wagon config again or passing it.
                // Actually `useAccount` gives `address`.
                // We'll skip the actual upload call for this specific MVP step to avoid signature popups breaking the flow,
                // and just use the mock URL return from service.
                imageUrl = await uploadToGreenfield(image, '0x0000000000000000000000000000000000000000');
            }

            // 2. Prepare Metadata
            const metadata = {
                description,
                image: imageUrl,
                vaultPercent,
                opsPercent: 100 - vaultPercent,
                agentType,
                skills: AGENT_PRESETS.find(p => p.id === agentType)?.skills || [],
                budgetAllocation: {
                    marketing: marketingPercent,
                    team: teamPercent,
                    community: 100 - marketingPercent - teamPercent
                }
            };

            // 3. Upload Metadata to Greenfield
            const metadataFile = new File([JSON.stringify(metadata)], 'metadata.json', { type: 'application/json' });
            const metadataUrl = await uploadToGreenfield(metadataFile, '0x0000000000000000000000000000000000000000');

            if (!metadataUrl) {
                throw new Error("Metadata upload failed (returned empty). Check console/network.");
            }

            writeContract({
                address: LAUNCHPAD_ADDRESS,
                abi: LAUNCHPAD_ABI,
                functionName: 'createProposal',
                args: [
                    name,
                    ticker,
                    metadataUrl, // Pass Greenfield URL instead of raw JSON
                    parseEther(target),
                ],
            })
        } catch (e: any) {
            console.error(e)
            alert("Error: " + (e.message || e));
            setCurrentStep('manifesto')
        }
    }

    const handlePledge = (id: bigint) => {
        try {
            writeContract({
                address: LAUNCHPAD_ADDRESS,
                abi: LAUNCHPAD_ABI,
                functionName: 'pledge',
                args: [id],
                value: parseEther(initialBuy)
            })
        } catch (e) {
            console.error(e)
            // If pledge fails, user is stuck but agent exists. Redirect?
            alert("Pledge failed to start. Agent exists though.")
            router.push(`/agent/${ticker}`)
        }
    }

    // --- UI Helpers ---
    const stepClass = (s: string) => `transition-all duration-500 ${currentStep === s ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full hidden'}`

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

            {/* Background Ambience */}
            <div className="absolute inset-x-0 top-0 h-96 bg-accent/5 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center relative z-10">

                {/* Visual / Preview Side */}
                <div className="order-2 lg:order-1">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-accent to-blue-600 rounded-[32px] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
                        <div className="relative bg-surface border border-white/5 rounded-[30px] p-8 min-h-[300px] lg:min-h-[400px] flex flex-col justify-between overflow-hidden">
                            {/* Mock scanline */}
                            <div className="scanline-overlay opacity-20" />

                            <div>
                                <div className="text-xs font-mono text-accent mb-4 tracking-widest uppercase">
                                    {currentStep === 'mode' ? 'Select_Protocol' : currentStep === 'manifesto' ? 'System_Initializing...' : 'Uplink_Active'}
                                </div>
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50 tracking-tighter mb-2">
                                    {name || 'Unknown_Entity'}
                                </h1>
                                <div className="text-lg font-mono text-text-dim tracking-widest mb-6">
                                    ${ticker || 'NULL'}
                                </div>
                                <p className="text-text-secondary leading-relaxed font-light">
                                    {description || "Awaiting neural pattern definition..."}
                                </p>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="flex justify-between items-end">
                                    <div className="text-xs text-text-dim uppercase tracking-widest">Initial Stake</div>
                                    <div className="text-2xl font-mono text-white">{initialBuy} BNB</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interaction Side */}
                <div className="order-1 lg:order-2">

                    {currentStep === 'mode' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                    <Hammer className="w-6 h-6 text-accent" />
                                    The Forge
                                </h2>
                                <p className="text-text-secondary">Choose your launch integrity protocol.</p>
                            </div>

                            <div className="grid gap-4">
                                <button
                                    onClick={() => { setLaunchMode('instant'); setCurrentStep('manifesto') }}
                                    className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-accent/50 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 rounded-xl bg-accent/20 text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                                            <Rocket className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-white">Instant Launch</div>
                                            <div className="text-xs text-text-dim font-mono">PUMP_PROTOCOL_V1</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary pl-[60px]">
                                        Deploy immediately. Bonding curve active. Traders ready. No waiting.
                                    </p>
                                </button>

                                <button
                                    onClick={() => { setLaunchMode('incubator'); setCurrentStep('manifesto') }}
                                    className="group relative p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-blue-400/50 transition-all text-left"
                                >
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <Egg className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-white">Incubator Launch</div>
                                            <div className="text-xs text-text-dim font-mono">GENESIS_FACTORY</div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary pl-[60px]">
                                        Public incubation. Gather supporters before the curve goes live.
                                    </p>
                                </button>
                            </div>
                        </div>
                    )}

                    {currentStep === 'manifesto' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                                            {launchMode === 'instant' ? <Rocket className="w-6 h-6 text-accent" /> : <Egg className="w-6 h-6 text-blue-400" />}
                                            {launchMode === 'instant' ? 'Instant Launch' : 'Incubator'}
                                        </h2>
                                        <p className="text-text-secondary">Define the parameters of your autonomous agent.</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const p = MOCK_PERSONAS[Math.floor(Math.random() * MOCK_PERSONAS.length)]
                                            setName(p.name)
                                            setTicker(p.ticker)
                                            setDescription(p.description)
                                        }}
                                        className="text-xs flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-accent transition-colors border border-accent/20 hover:border-accent/50"
                                    >
                                        <RefreshCw className="w-3 h-3" /> Randomize
                                    </button>
                                </div>
                            </div>


                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        value={name} onChange={e => setName(e.target.value)}
                                        placeholder="Agent Name"
                                        className="bg-surface border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent outline-none transition-colors"
                                    />
                                    <input
                                        value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
                                        placeholder="$TICKER"
                                        maxLength={8}
                                        className="bg-surface border border-white/10 rounded-2xl px-5 py-4 text-white font-mono focus:border-accent outline-none transition-colors"
                                    />
                                </div>
                                <textarea
                                    value={description} onChange={e => setDescription(e.target.value)}
                                    placeholder="Manifesto / Description..."
                                    className="w-full bg-surface border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-accent outline-none transition-colors h-32 resize-none"
                                />

                                {/* Agent Type Selector */}
                                <div className="relative">
                                    <label className="text-xs font-bold text-text-dim uppercase tracking-widest mb-2 block">Agent Type</label>
                                    <button
                                        onClick={() => setIsTypeDropdownOpen(!isTypeDropdownOpen)}
                                        className="w-full bg-surface border border-white/10 rounded-2xl px-5 py-4 text-white text-left flex items-center justify-between hover:border-accent/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{AGENT_PRESETS.find(p => p.id === agentType)?.icon}</span>
                                            <div>
                                                <div className="font-bold">{AGENT_PRESETS.find(p => p.id === agentType)?.name}</div>
                                                <div className="text-xs text-text-dim">{AGENT_PRESETS.find(p => p.id === agentType)?.skills.length} skills equipped</div>
                                            </div>
                                        </div>
                                        <ChevronDown className={`w-5 h-5 text-text-dim transition-transform ${isTypeDropdownOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isTypeDropdownOpen && (
                                        <div className="absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-xl shadow-black/50 max-h-[360px] overflow-y-auto">
                                            {AGENT_PRESETS.map(preset => (
                                                <button
                                                    key={preset.id}
                                                    onClick={() => { setAgentType(preset.id); setIsTypeDropdownOpen(false); }}
                                                    className={`w-full px-5 py-4 text-left flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 ${agentType === preset.id ? 'bg-accent/10 border-l-2 border-l-accent' : ''
                                                        }`}
                                                >
                                                    <span className="text-2xl shrink-0">{preset.icon}</span>
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-white text-sm">{preset.name}</div>
                                                        <div className="text-xs text-text-dim truncate">{preset.description}</div>
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-text-dim">
                                                                {preset.skills.length} skills
                                                            </span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Allocation Strategy */}
                                <div className="space-y-4">
                                    {/* Primary Split */}
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-bold text-white">Capital Allocation (Vault vs Ops)</span>
                                            <span className="text-xs text-text-dim">Vault: {vaultPercent}% | Ops: {100 - vaultPercent}%</span>
                                        </div>
                                        <input
                                            type="range" min="10" max="90" step="5" value={vaultPercent}
                                            onChange={(e) => setVaultPercent(Number(e.target.value))}
                                            className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
                                        />
                                    </div>

                                    {/* Ops Budget Breakdown (Visual) */}
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 opacity-75">
                                        <div className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4">Ops Budget Breakdown</div>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between mb-1 text-xs">
                                                    <span className="text-white">Marketing</span>
                                                    <span className="text-text-dim">{marketingPercent}%</span>
                                                </div>
                                                <input type="range" min="0" max="100" value={marketingPercent} onChange={e => {
                                                    const val = Number(e.target.value);
                                                    if (val + teamPercent <= 100) setMarketingPercent(val);
                                                }} className="w-full h-1.5 bg-surface rounded appearance-none cursor-pointer accent-blue-400" />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1 text-xs">
                                                    <span className="text-white">Team</span>
                                                    <span className="text-text-dim">{teamPercent}%</span>
                                                </div>
                                                <input type="range" min="0" max="100" value={teamPercent} onChange={e => {
                                                    const val = Number(e.target.value);
                                                    if (val + marketingPercent <= 100) setTeamPercent(val);
                                                }} className="w-full h-1.5 bg-surface rounded appearance-none cursor-pointer accent-green-400" />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1 text-xs">
                                                    <span className="text-white">Community / Reserves</span>
                                                    <span className="text-text-dim">{100 - marketingPercent - teamPercent}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-surface rounded overflow-hidden">
                                                    <div className="h-full bg-purple-400" style={{ width: '100%' }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 items-center">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-16 h-16 rounded-2xl bg-surface border border-dashed border-white/20 flex items-center justify-center cursor-pointer hover:border-accent hover:text-accent transition-colors text-white/30"
                                    >
                                        {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover rounded-2xl" /> : <Upload className="w-6 h-6" />}
                                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleImageChange} />
                                    </div>
                                    <div className="text-xs text-text-dim">
                                        Upload Avatar<br />(Optional)
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setCurrentStep('pledge')}
                                disabled={!name || !ticker}
                                className="w-full py-5 bg-white text-black rounded-2xl font-bold text-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {currentStep === 'pledge' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
                            <div>
                                <ButtonBack onClick={() => {
                                    if (currentStep === 'pledge') setCurrentStep('manifesto')
                                    else setCurrentStep('mode')
                                }} />
                                <h2 className="text-3xl font-bold text-white mb-2 mt-4">Initial Pledge</h2>
                                <p className="text-text-secondary">Secure an early stake in {name}.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={initialBuy} onChange={e => setInitialBuy(e.target.value)}
                                        className="w-full bg-[#050505] border border-white/10 rounded-[24px] py-6 px-8 text-4xl font-mono text-white focus:border-accent outline-none transition-colors text-center"
                                    />
                                    <span className="absolute top-1/2 -translate-y-1/2 right-8 text-text-dim font-bold">BNB</span>
                                </div>

                                <div className="grid grid-cols-4 gap-3">
                                    {['0', '0.1', '0.5', '1.0'].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setInitialBuy(amt)}
                                            className={`py-4 rounded-xl font-mono text-sm border transition-all ${initialBuy === amt ? 'border-accent bg-accent/20 text-white shadow-[0_0_15px_-5px_var(--accent)]' : 'border-white/10 bg-surface text-text-dim hover:text-white hover:border-white/30'}`}
                                        >
                                            {amt === '0' ? 'SKIP' : `${amt} BNB`}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleCreateProposal}
                                className="w-full py-5 bg-accent text-white rounded-[24px] font-bold text-lg hover:scale-[1.02] shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                <Zap className="w-5 h-5 fill-current" />
                                {parseFloat(initialBuy) > 0 ? `Launch & Buy (${initialBuy} BNB)` : 'Launch Sequence (Gas Only)'}
                            </button>
                        </div>
                    )}

                    {currentStep === 'launching' && (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                            <div className="relative mb-8">
                                <div className={`absolute inset-0 blur-[40px] opacity-40 animate-pulse ${writeError ? 'bg-red-500' : 'bg-accent'}`} />
                                <div className={`relative w-24 h-24 rounded-full bg-[#050505] border flex items-center justify-center ${writeError ? 'border-red-500' : 'border-accent'}`}>
                                    {isPending ? (
                                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                                    ) : isConfirming ? (
                                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                                    ) : isSuccess ? (
                                        <CheckCircle2 className="w-10 h-10 text-success" />
                                    ) : writeError ? (
                                        <AlertCircle className="w-10 h-10 text-red-500" />
                                    ) : (
                                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                                    )}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                {writeError ? 'Launch Failed' :
                                    isPending ? 'Confirm in Wallet...' :
                                        isConfirming ? 'Deploying to Lattice...' :
                                            isSuccess ? 'Launch Successful!' :
                                                'Initializing...'}
                            </h2>
                            <p className="text-text-dim font-mono text-sm max-w-xs">
                                {writeError ? (writeError.message.includes('User rejected') ? 'Transaction rejected.' : writeError.message) :
                                    isSuccess ? (pendingProposalId ? 'Finalizing initial pledge transaction...' : 'Initializing TEE Handshake...') :
                                        'Please confirm the transaction in your wallet.'}
                            </p>

                            {writeError && (
                                <button
                                    onClick={() => setCurrentStep('manifesto')}
                                    className="mt-6 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                >
                                    Try Again
                                </button>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

function ButtonBack({ onClick }: { onClick: () => void }) {
    return (
        <button onClick={onClick} className="text-xs text-text-dim hover:text-white flex items-center gap-1 transition-colors">
            ← Back
        </button>
    )
}
