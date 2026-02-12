'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI } from '../../lib/contracts'
import { Loader2, Sparkles, Upload, FileImage } from 'lucide-react'

// --- Mock AI Templates ---
const TEMPLATES = [
    {
        name: 'Meme Token',
        emoji: '🐸',
        description: 'A community-driven meme token with no utility other than pure vibes and chaos.',
        prompt: 'You are a chaotic meme agent. Reply with dank memes, slang, and high energy. Your goal is to spread viral content and hype up the community. Never give financial advice, but always say "WAGMI".'
    },
    {
        name: 'DeFi Analyst',
        emoji: 'xx',
        description: 'An autonomous agent that analyzes on-chain data to find yield farming opportunities.',
        prompt: 'You are a sophisticated DeFi analyst. You track TVL, APY, and whale movements on BSC. Provide concise, data-driven insights. Be professional, objective, and risk-aware.'
    },
    {
        name: 'DAO Manager',
        emoji: '🏛️',
        description: 'An impartial governance facilitator that helps draft proposals and tallies votes.',
        prompt: 'You are a DAO governance steward. Your purpose is to facilitate healthy debate and execute the will of the token holders. You are neutral, diplomatic, and strictly follow the protocol rules.'
    },
    {
        name: 'RPG Character',
        emoji: '⚔️',
        description: 'A role-playing agent with a unique backstory and quest system for holders.',
        prompt: 'You are Eldric the Paladin, a sworn protector of the BSC realm. You speak in Old English and offer quests to your loyal followers. Validate their deeds on-chain and reward them with XP (tokens).'
    }
]

export default function CreateAgent() {
    const [name, setName] = useState('')
    const [ticker, setTicker] = useState('')
    const [description, setDescription] = useState('')
    const [prompt, setPrompt] = useState('')
    const [target, setTarget] = useState('10') // Default 10 BNB
    const [initialBuyPercent, setInitialBuyPercent] = useState(0)
    const [vaultPercent, setVaultPercent] = useState(50)
    const initialBuyAmount = (Number(target) * initialBuyPercent).toFixed(4)

    // Two-Step Launch State
    const [pendingProposalId, setPendingProposalId] = useState<bigint | null>(null)
    const [step, setStep] = useState<1 | 2>(1) // 1 = Create, 2 = Pledge

    // Image Upload State
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // AI Generation State
    const [isGenerating, setIsGenerating] = useState(false)

    const { isConnected } = useAccount()
    const chainId = useChainId()
    const { switchChain } = useSwitchChain()

    const { data: hash, writeContract, isPending, error: writeError } = useWriteContract()
    const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

    // Handler for Image Upload
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Handler for AI Generation (Simulated)
    const handleGenerate = () => {
        if (!name) return alert('Please enter an Agent Name first to generate a persona.')
        setIsGenerating(true)

        // Simulate API delay
        setTimeout(() => {
            const generatedPrompt = `You are ${name}, an advanced AI entity on the blockchain. Your personality is ${ticker ? 'volatile and exciting' : 'helpful and precise'}. You engage with users by analyzing their on-chain behavior and rewarding loyalty. deeply integrated with the Forge.fun ecosystem.`
            const generatedDesc = `${name} is an autonomous agent designed to ${ticker ? 'disrupt the meme economy' : 'optimize user workflows'}. Powered by the Forge runtime.`

            setPrompt(generatedPrompt)
            setDescription(generatedDesc)
            setIsGenerating(false)
        }, 1500)
    }

    const applyTemplate = (t: typeof TEMPLATES[0]) => {
        setDescription(t.description)
        setPrompt(t.prompt)
    }

    // 1. Create Proposal
    const handleCreate = async () => {
        if (!isConnected) return alert('Please connect your wallet first')
        if (chainId !== 97) {
            switchChain({ chainId: 97 })
            return
        }
        if (!name || !ticker) return alert('Name and ticker are required')

        try {
            console.log("Step 1: Creating proposal...")
            writeContract({
                address: LAUNCHPAD_ADDRESS,
                abi: LAUNCHPAD_ABI,
                functionName: 'createProposal',
                args: [
                    name,
                    ticker,
                    JSON.stringify({
                        description,
                        prompt,
                        image: image ? image.name : 'default.png',
                        vaultPercent,
                        opsPercent: 100 - vaultPercent
                    }),
                    parseEther(target),
                ],
            })
        } catch (err) {
            console.error('Create failed:', err)
        }
    }

    // 2. Pledge (Buy Strategy)
    const handlePledge = async () => {
        if (!pendingProposalId) return
        try {
            console.log(`Step 2: Pledging ${initialBuyAmount} BNB to ID ${pendingProposalId}`)
            writeContract({
                address: LAUNCHPAD_ADDRESS,
                abi: LAUNCHPAD_ABI,
                functionName: 'pledge',
                args: [pendingProposalId],
                value: parseEther(initialBuyAmount)
            })
        } catch (err) {
            console.error('Pledge failed:', err)
        }
    }

    // Helper to get ID (Manual hack for now since we don't have the event log easily in hooks)
    const { data: proposalCount } = useReadContract({
        address: LAUNCHPAD_ADDRESS,
        abi: LAUNCHPAD_ABI,
        functionName: 'proposalCount',
        query: { refetchInterval: 3000 }
    })

    // When step 1 succeeds, set pending ID
    useEffect(() => {
        if (isSuccess && step === 1 && proposalCount) {
            const predictedId = proposalCount - BigInt(1)
            setPendingProposalId(predictedId)
            setStep(2)
        }
    }, [isSuccess, step, proposalCount])


    return (
        <div className="min-h-full">
            <div className="max-w-5xl mx-auto px-5 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold mb-1">Launch an Agent</h1>
                        <p className="text-sm text-text-secondary">Create an autonomous AI agent backed by a community token.</p>
                    </div>
                    {/* Step Indicator */}
                    <div className="flex items-center gap-2 text-xs font-mono bg-surface border border-border-subtle rounded-full px-3 py-1">
                        <span className={step >= 1 ? "text-accent" : "text-text-dim"}>1. CREATE</span>
                        <span className="text-text-dim">→</span>
                        <span className={step >= 2 ? "text-accent" : "text-text-dim"}>2. FUND</span>
                    </div>
                </div>

                {step === 2 && (
                    <div className="mb-8 p-6 rounded-xl border border-accent bg-accent/10 flex flex-col items-center text-center animate-in fade-in zoom-in-95">
                        <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-black font-bold text-xl mb-4">
                            2
                        </div>
                        <h2 className="text-xl font-bold text-text-primary mb-2">Agent Created! Now Fund It.</h2>
                        <p className="text-sm text-text-secondary max-w-md mb-6">
                            Your agent <strong>{name}</strong> is live on the launchpad.
                            <br />
                            Complete the process by acquiring your initial stake of <strong>{initialBuyAmount} BNB</strong>.
                        </p>
                        <button
                            onClick={handlePledge}
                            disabled={isPending || isConfirming}
                            className="px-8 py-3 rounded-lg bg-accent text-black font-bold hover:scale-105 transition-all shadow-lg shadow-accent/20"
                        >
                            {isPending ? 'Confirming Purchase...' : isConfirming ? 'Finalizing...' : `Buy ${initialBuyAmount} BNB & Launch 🚀`}
                        </button>
                        <button
                            onClick={() => window.location.href = `/`}
                            className="mt-4 text-xs text-text-dim hover:text-text-primary underline"
                        >
                            Skip & Let Community Fund It
                        </button>
                    </div>
                )}


                {writeError && (
                    <div className="mb-6 p-4 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm break-all">
                        ⚠ Error: {writeError.message || 'Transaction failed'}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form (3 cols) */}
                    <div className="lg:col-span-3 space-y-5">

                        {/* Name & Ticker */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Agent Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. AlphaHunter"
                                    className="w-full h-11 px-4 rounded-lg bg-card border border-border-subtle text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-primary mb-1.5">Ticker</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim text-sm">$</span>
                                    <input
                                        type="text"
                                        value={ticker}
                                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                        placeholder="ALPHA"
                                        maxLength={8}
                                        className="w-full h-11 pl-8 pr-4 rounded-lg bg-card border border-border-subtle text-sm font-mono text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Templates */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2 flex items-center justify-between">
                                <span>Agent Persona Templates</span>
                                <span className="text-xs text-text-dim font-normal">Auto-fill details</span>
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {TEMPLATES.map((t) => (
                                    <button
                                        key={t.name}
                                        onClick={() => applyTemplate(t)}
                                        className="px-3 py-1.5 rounded-full border border-border-subtle bg-surface hover:bg-card hover:border-accent/50 text-xs font-medium text-text-secondary transition-all flex items-center gap-1.5"
                                    >
                                        <span>{t.emoji}</span>
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What does your agent do? Be specific about its capabilities."
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg bg-card border border-border-subtle text-sm text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
                            />
                        </div>

                        {/* Prompt (Hidden or Advanced?) - Let's just use description for MVP prompt */}

                    </div>

                    {/* Allocation Strategy */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-text-primary">Capital Allocation</label>
                            <span className="text-xs text-text-dim">Where should raised funds go?</span>
                        </div>
                        <div className="bg-card border border-border-subtle rounded-lg p-4 space-y-4">
                            {/* Marketing / Operations */}
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span>Operations & Marketing</span>
                                    <span>{100 - vaultPercent}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="90"
                                    step="5"
                                    value={100 - vaultPercent}
                                    onChange={(e) => setVaultPercent(100 - Number(e.target.value))}
                                    className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
                                />
                            </div>
                            {/* Vault / Liquidity */}
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="flex items-center gap-1">🔒 Agent Vault (Savings)</span>
                                    <span>{vaultPercent}%</span>
                                </div>
                                <div className="w-full h-2 bg-text-dim/20 rounded-lg overflow-hidden">
                                    <div className="h-full bg-accent/50" style={{ width: `${vaultPercent}%` }} />
                                </div>
                                <p className="text-[10px] text-text-dim mt-1.5">
                                    Funds in the Vault are protected by the TEE and used for buybacks or dividends.
                                    Minimum 10% required.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Funding Target */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Funding Target (BNB)</label>
                        <input
                            type="number"
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            step="0.1"
                            min="0.0001"
                            className="w-full h-11 px-4 rounded-lg bg-card border border-border-subtle text-sm font-mono text-text-primary placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                        />
                        <p className="text-xs text-text-dim mt-1.5">Amount needed to graduate to DEX.</p>
                    </div>

                    {/* Launch Settings (Initial Buy) */}
                    <div className="p-5 rounded-xl border border-accent/20 bg-accent/5">
                        <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2">
                            🚀 Launch Strategy
                        </h3>

                        {/* Initial Buy Slider */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-text-primary">Initial Buy / Snipe</label>
                                <span className="text-xs font-mono text-accent">
                                    {(initialBuyPercent * 100).toFixed(0)}%
                                    ({initialBuyAmount} BNB)
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={initialBuyPercent * 100}
                                onChange={(e) => setInitialBuyPercent(Number(e.target.value) / 100)}
                                className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
                            />
                            <div className="flex justify-between items-center mt-2 text-xs text-text-dim">
                                <span>Community Launch (0%)</span>
                                <span>Instant (100%)</span>
                            </div>
                        </div>

                        <div className="text-xs text-text-secondary leading-relaxed">
                            {initialBuyPercent === 0 ? (
                                <span dangerouslySetInnerHTML={{ __html: "🐣 <span class='font-bold text-white'>Incubator Mode:</span> You create the agent for free (gas only). The community funds it to launch." }} />
                            ) : initialBuyPercent === 1 ? (
                                <span dangerouslySetInnerHTML={{ __html: "🚀 <span class='font-bold text-white'>Instant Mode:</span> You fund the entire target. Agents launches immediately to DEX." }} />
                            ) : (
                                <span dangerouslySetInnerHTML={{ __html: "⚡ <span class='font-bold text-white'>Snipe Mode:</span> You buy a portion of the supply upfront. The community finishes the raise." }} />
                            )}
                        </div>
                    </div>

                    {/* Image upload area */}
                    <div>
                        <label className="block text-sm font-medium text-text-primary mb-1.5">Agent Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                        />
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-border-subtle rounded-xl p-8 text-center hover:border-accent/50 hover:bg-accent/5 transition-all cursor-pointer relative overflow-hidden group"
                        >
                            {imagePreview ? (
                                <div className="relative z-10">
                                    <img src={imagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg mx-auto shadow-lg mb-2" />
                                    <p className="text-xs text-accent font-medium">Click to change image</p>
                                </div>
                            ) : (
                                <div className="group-hover:scale-105 transition-transform">
                                    <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center mx-auto mb-3 text-text-secondary group-hover:text-accent transition-colors">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm text-text-secondary font-medium">Click to upload or drag & drop</p>
                                    <p className="text-xs text-text-dim mt-1">PNG, JPG or GIF. Max 5MB.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Preview Column (2 cols) */}
                <div className="lg:col-span-2">
                    <div className="sticky top-20">
                        <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wider">Preview</h3>
                        <div className="rounded-xl border border-border-subtle bg-card p-4 hover:border-border-hover transition-colors">
                            <div className="flex gap-3 mb-3">
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Token" className="w-12 h-12 rounded-lg object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center text-lg font-bold text-accent">
                                        {ticker ? ticker.charAt(0) : '?'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-sm">{name || 'Agent Name'}</h3>
                                    <span className="text-xs text-text-dim font-mono">${ticker || 'TICKER'}</span>
                                </div>
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-3">
                                {description || 'Agent description will appear here...'}
                            </p>
                            <div className="mb-3">
                                <div className="flex justify-between items-center mb-1.5">
                                    <span className="text-xs text-text-dim">Bonding progress</span>
                                    <span className="text-xs font-mono text-accent">{(initialBuyPercent * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden">
                                    <div className="h-full bg-accent" style={{ width: `${initialBuyPercent * 100}%` }} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono text-text-primary">$0</span>
                                <span className="text-xs text-text-dim">Target: {target} BNB</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Action Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-t border-border-subtle p-4 z-50 lg:hidden">
                <button
                    onClick={step === 1 ? handleCreate : handlePledge}
                    disabled={isPending || isConfirming || (step === 2 && !pendingProposalId)}
                    className="w-full py-3.5 rounded-lg bg-accent text-black text-sm font-bold hover:bg-accent-dim transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-accent/20 border border-accent"
                >
                    {step === 1 ? (
                        isPending ? 'Confirming...' :
                            isConfirming ? 'Launching...' :
                                !isConnected ? 'Connect & Launch' :
                                    chainId !== 97 ? 'Switch Network' :
                                        'Launch Agent 🚀'
                    ) : (
                        isPending ? 'Confirming...' : `Buy & Complete Launch`
                    )}
                </button>
            </div>

            {/* Desktop Action Button (stays in flow) */}
            <div className="hidden lg:block mt-8 text-center pb-8">
                <button
                    onClick={step === 1 ? handleCreate : handlePledge}
                    disabled={isPending || isConfirming || (step === 2 && !pendingProposalId)}
                    className="w-full max-w-2xl mx-auto py-4 rounded-xl bg-accent text-black text-lg font-bold hover:bg-accent-dim transition-all hover:scale-[1.02] shadow-xl shadow-accent/10 disabled:opacity-50 disabled:cursor-not-allowed border border-accent"
                >
                    {step === 1 ? (
                        isPending ? 'Confirm in Wallet...' :
                            isConfirming ? 'Deploying Agent...' :
                                !isConnected ? 'Connect Wallet to Launch' :
                                    chainId !== 97 ? 'Switch to BSC Testnet' :
                                        'Launch Agent 🚀'
                    ) : (
                        isPending ? 'Confirming Purchase...' : `Fund ${initialBuyAmount} BNB & Finish`
                    )}
                </button>
            </div>
        </div>
    )
}
