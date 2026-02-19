'use client'

export const dynamic = 'force-dynamic'

import React from 'react'
import { Activity, Rocket, Info, Loader2 } from 'lucide-react'
import { useAgents } from '../../hooks/useAgents'
import TokenRow from '../../components/TokenRow'
import { useQueryClient } from '@tanstack/react-query'

export default function LiveAgentsPage() {
    // Use the global hook which is fed by SocketConnector + Polling
    const { data: agents = [], isLoading: loading } = useAgents()
    const queryClient = useQueryClient()

    const liveAgents = agents.filter(a => a.launched || a.launchMode === 'instant')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const handleDeepSync = async () => {
        try {
            await fetch('/api/sync-registry', { method: 'POST' });
            queryClient.invalidateQueries({ queryKey: ['agents'] })
        } catch (e) {
            console.error("Sync failed", e)
        }
    }

    return (
        <div className="min-h-screen bg-[#050505] text-text-primary p-6 lg:p-12 space-y-10 relative overflow-hidden">
            {/* Background Aesthetic */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-success/5 rounded-full blur-[100px] -z-10" />

            <header className="flex flex-col gap-4 relative z-10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl">
                            <Rocket className="w-7 h-7 text-accent" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                                Live Agents
                            </h1>
                            <p className="text-text-dim text-sm mt-1 font-medium">
                                Obsidian Network • Real-time Operations
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleDeepSync}
                        disabled={loading}
                        className="group flex items-center gap-3 px-6 py-2.5 rounded-full bg-white text-black hover:bg-white/90 transition-all duration-300 disabled:opacity-50 font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Activity className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Sync Deep Scan</span>
                    </button>
                </div>
            </header>

            <section className="bg-white/[0.02] border border-white/10 rounded-[32px] overflow-hidden backdrop-blur-xl shadow-2xl relative z-10">
                <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-success animate-ping" />
                        <span className="text-sm font-semibold text-white tracking-wide uppercase">Operational Hub</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-[10px] text-white/80 uppercase font-black tracking-widest">
                            {liveAgents.length} Agents Active
                        </span>
                    </div>
                </div>

                {loading ? (
                    <div className="p-32 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                        <p className="text-text-dim font-medium tracking-wide animate-pulse uppercase text-xs">Synchronizing with Blockchain...</p>
                    </div>
                ) : liveAgents.length > 0 ? (
                    <div className="flex flex-col">
                        <div className="grid grid-cols-12 gap-4 px-8 py-4 text-[10px] text-white/40 uppercase tracking-[0.2em] font-black border-b border-white/5 bg-white/[0.01]">
                            <div className="col-span-4">Agent Identity</div>
                            <div className="col-span-2 hidden sm:block">Deployment Status</div>
                            <div className="col-span-2 hidden sm:block">Market Valuation</div>
                            <div className="col-span-2 hidden sm:block">24h Throughput</div>
                            <div className="col-span-2 text-right pr-4">Action</div>
                        </div>
                        <div className="divide-y divide-white/[0.03]">
                            {liveAgents.map(agent => (
                                <TokenRow key={agent.id} agent={agent} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-32 text-center flex flex-col items-center space-y-6">
                        <div className="inline-flex p-6 rounded-[24px] bg-white/[0.03] border border-white/10 mb-2">
                            <Info className="w-10 h-10 text-white/20" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-white">No Agents in Range</h3>
                            <p className="text-text-dim max-w-sm mx-auto leading-relaxed">
                                Our scanners found no active deployments within the specified block range.
                                Newly launched agents will manifest here in real-time.
                            </p>
                        </div>
                        <button
                            onClick={() => window.location.href = '/create'}
                            className="px-8 py-3 rounded-full bg-accent text-white font-bold hover:brightness-110 transition-all shadow-lg shadow-accent/20"
                        >
                            Launch First Agent
                        </button>
                    </div>
                )}
            </section>
        </div>
    )
}
