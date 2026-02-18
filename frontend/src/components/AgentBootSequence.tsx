'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Shield, Zap, Database, CheckCircle2 } from 'lucide-react'

const steps = [
    { text: "Initializing Neural Kernel...", icon: Terminal, delay: 0 },
    { text: "Verifying TEE Enclave Signature...", icon: Shield, delay: 800 },
    { text: "Deploying Liquidity Matrix...", icon: Database, delay: 2000 },
    { text: "Establishing Secure Uplink...", icon: Zap, delay: 3500 },
]

export default function AgentBootSequence({ onComplete }: { onComplete?: () => void }) {
    const [currentStep, setCurrentStep] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentStep(prev => {
                const next = prev + 1
                if (next >= steps.length + 1) {
                    clearInterval(timer)
                    setTimeout(() => onComplete?.(), 1000)
                }
                return next
            })
        }, 1200) // Step duration

        return () => clearInterval(timer)
    }, [])

    return (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
            <div className="w-full max-w-md font-mono">
                <div className="flex items-center gap-2 mb-8 text-accent/80 border-b border-white/10 pb-4">
                    <Terminal className="w-5 h-5" />
                    <span className="text-sm tracking-widest uppercase">Obsidian OS v2.0.4 // Bootloader</span>
                </div>

                <div className="space-y-6">
                    {steps.map((step, index) => {
                        const isActive = index === currentStep
                        const isCompleted = index < currentStep

                        return (
                            <div key={index} className={`flex items-center gap-4 transition-all duration-500 ${isCompleted ? 'opacity-50' : isActive ? 'opacity-100' : 'opacity-10'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${isCompleted ? 'bg-success/20 border-success/30 text-success' : isActive ? 'bg-accent/20 border-accent/30 text-accent' : 'border-white/5 text-white/5'}`}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className={`text-sm ${isCompleted ? 'text-success' : isActive ? 'text-white' : 'text-gray-600'}`}>
                                        {step.text}
                                    </div>
                                    {isActive && (
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 1.2, ease: "linear" }}
                                            className="h-0.5 bg-accent mt-1"
                                        />
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-12 text-xs text-center text-text-dim animate-pulse">
                    ENCRYPTED CONNECTION :: SECURE
                </div>
            </div>
        </div>
    )
}
