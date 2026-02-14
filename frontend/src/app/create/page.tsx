'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { LAUNCHPAD_ADDRESS, LAUNCHPAD_ABI } from '../../lib/contracts'
import { Loader2, Sparkles, Upload, FileImage, Hammer, Zap, ArrowRight, CheckCircle2, RefreshCw, Rocket, Egg } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MOCK_PERSONAS } from '../../data/mock'

export default function CreateAgent() {
    const router = useRouter()
    // --- State ---
    const [name, setName] = useState('')
    const [ticker, setTicker] = useState('')
    const [description, setDescription] = useState('')
    const [target, setTarget] = useState('10')
    const [initialBuy, setInitialBuy] = useState('0')
    const [vaultPercent, setVaultPercent] = useState(50)

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
                setTimeout(() => router.push(`/agent/${ticker}`), 2000)
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

    const handleCreateProposal = () => {
        if (!name || !ticker) return alert("Name and Ticker required")
        if (!isConnected) return alert("Connect Wallet")
        if (chainId !== 97) return switchChain({ chainId: 97 })

        setCurrentStep('launching')

        try {
            writeContract({
                address: LAUNCHPAD_ADDRESS,
                abi: LAUNCHPAD_ABI,
                functionName: 'createProposal',
                args: [
                    name,
                    ticker,
                    JSON.stringify({
                        description,
                        image: image ? image.name : 'default.png',
                        vaultPercent,
                        opsPercent: 100 - vaultPercent
                    }),
                    parseEther(target),
                ],
            })
        } catch (e) {
            console.error(e)
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

                                {/* Allocation Strategy */}
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-bold text-white">Capital Allocation</span>
                                        <span className="text-xs text-text-dim">Vault: {vaultPercent}% | Ops: {100 - vaultPercent}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="90"
                                        step="5"
                                        value={vaultPercent}
                                        onChange={(e) => setVaultPercent(Number(e.target.value))}
                                        className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
                                    />
                                    <p className="text-[10px] text-text-dim mt-2 leading-tight">
                                        {vaultPercent}% of raised funds are locked in the TEE Vault for buybacks.
                                        {100 - vaultPercent}% goes to the creator (Ops).
                                    </p>
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
                                    else setCurrentStep('mode') // Back logic fix
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
                                <div className="absolute inset-0 bg-accent blur-[40px] opacity-40 animate-pulse" />
                                <div className="relative w-24 h-24 rounded-full bg-[#050505] border border-accent flex items-center justify-center">
                                    {isConfirming || isPending ? (
                                        <Loader2 className="w-10 h-10 text-accent animate-spin" />
                                    ) : (
                                        <CheckCircle2 className="w-10 h-10 text-success" />
                                    )}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-white mb-2">
                                {isPending ? 'Confirm in Wallet...' : isConfirming ? 'Deploying to Lattice...' : 'Launch Successful!'}
                            </h2>
                            <p className="text-text-dim font-mono text-sm max-w-xs">
                                {pendingProposalId ? 'Finalizing initial pledge transaction...' : 'Initializing TEE Handshake...'}
                            </p>
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
