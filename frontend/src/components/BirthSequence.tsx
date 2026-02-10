'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const LOGS = [
    "Initializing TEE Vault (Intel SGX)...",
    "Generating Programmatic Email Identity...",
    "Connecting OpenClaw Orchestrator...",
    "Registering X Account (@AgentName)...",
    "Purchasing X Premium via Gas Tank...",
    "Deploying Token Contract to BNB Chain...",
    "GENESIS COMPLETE."
]

export default function BirthSequence() {
    const [logIndex, setLogIndex] = useState(0)

    useEffect(() => {
        if (logIndex < LOGS.length - 1) {
            const timeout = setTimeout(() => {
                setLogIndex(prev => prev + 1)
            }, 800)
            return () => clearTimeout(timeout)
        }
    }, [logIndex])

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center font-mono text-green-500 p-8">
            <div className="w-full max-w-2xl border border-green-900 bg-black/90 p-6 rounded shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                {LOGS.slice(0, logIndex + 1).map((log, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-2"
                    >
                        <span className="opacity-50">[{((i + 1) * 0.45).toFixed(1)}s]</span> {log} <span className="text-electricPurple">{i < logIndex ? 'DONE' : 'PROCESSING...'}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
