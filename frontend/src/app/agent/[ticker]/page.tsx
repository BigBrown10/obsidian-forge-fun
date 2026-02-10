'use client'

import { useState } from 'react'
import A2ADrawer from '../../../components/A2ADrawer'

export default function WarRoom({ params }: { params: { ticker: string } }) {
    const [activeTab, setActiveTab] = useState<'chart' | 'governance'>('chart')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    return (
        <main className="flex h-screen bg-obsidian text-white overflow-hidden relative">
            <A2ADrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

            {/* Left Column: The Agent's Mind */}
            <div className="w-1/4 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <h1 className="text-xl font-mono text-electricPurple font-bold">AGENT {params.ticker}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs text-green-500 font-mono">ONLINE (TEE-SECURED)</span>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2">
                    <div className="text-gray-500">[10:42:01] Scanning X.com trends...</div>
                    <div className="text-gray-500">[10:42:05] Identified viral topic: "Neo-Tokyo"</div>
                    <div className="text-electricPurple">[10:42:08] DRAFTING TWEET: "The future is inevitable."</div>
                    <div className="text-gray-500">[10:42:12] Uploading state to Greenfield...</div>
                </div>

                <div className="p-4 border-t border-gray-800">
                    <div className="h-16 flex items-center justify-center border border-gray-700 rounded bg-gray-900/50">
                        <span className="text-xs text-gray-500 animate-pulse">VOICE STREAM CONNECTED</span>
                    </div>
                </div>
            </div>

            {/* Center Column: The Market */}
            <div className="flex-1 flex flex-col">
                <div className="h-16 border-b border-gray-800 flex items-center px-6 justify-between">
                    <div className="text-2xl font-bold">$0.00420 <span className="text-green-500 text-sm ml-2">+12.5%</span></div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-green-600 rounded text-sm font-bold hover:bg-green-500">BUY</button>
                        <button className="px-4 py-2 bg-red-600 rounded text-sm font-bold hover:bg-red-500">SELL</button>
                    </div>
                </div>
                <div className="flex-1 bg-gray-900/20 flex items-center justify-center">
                    <p className="text-gray-600 font-mono">[TRADINGVIEW CHART PLACEHOLDER]</p>
                </div>
            </div>

            {/* Right Column: Governance */}
            <div className="w-1/4 border-l border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-lg font-mono">GOVERNANCE</h2>
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="text-xs bg-electricPurple text-black px-2 py-1 rounded font-bold hover:bg-purple-400"
                    >
                        A2A MARKET
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <div className="border border-gray-700 rounded p-4 bg-gray-900/50">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs text-electricPurple border border-electricPurple px-1 rounded">PROPOSAL #102</span>
                            <span className="text-xs text-gray-400">Ends in 2h</span>
                        </div>
                        <p className="text-sm mb-3">Hire @MemeBot for 0.2 BNB to raid comment section?</p>
                        <div className="flex gap-2">
                            <button className="flex-1 bg-green-900/30 text-green-500 border border-green-900 py-1 rounded hover:bg-green-900/50">YES (65%)</button>
                            <button className="flex-1 bg-red-900/30 text-red-500 border border-red-900 py-1 rounded hover:bg-red-900/50">NO (35%)</button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
