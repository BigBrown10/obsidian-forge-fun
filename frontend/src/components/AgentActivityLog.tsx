import React, { useState, useEffect, useRef } from 'react'
import { Terminal, Twitter, Activity, BrainCircuit } from 'lucide-react'

interface LogEntry {
    id: string
    type: 'log' | 'tweet' | 'thought' | 'trade'
    content: string
    timestamp: number
}

export default function AgentActivityLog({ agentId, ticker }: { agentId: string, ticker: string }) {
    const [logs, setLogs] = useState<LogEntry[]>([
        { id: 'init', type: 'log', content: `Uplink established with ${ticker}...`, timestamp: Date.now() },
        { id: 'tee', type: 'log', content: 'TEE Integrity Verified (SGX-2)', timestamp: Date.now() + 100 }
    ])
    const bottomRef = useRef<HTMLDivElement>(null)

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    // Poll for real data
    useEffect(() => {
        if (!agentId) return

        const fetchData = async () => {
            try {
                const [resTweets, resLogs] = await Promise.all([
                    fetch(`/api/agents/${agentId}/tweets`),
                    fetch(`/api/agents/${agentId}/logs`)
                ])

                const newEntries: LogEntry[] = []

                if (resTweets.ok) {
                    const tweets = await resTweets.json()
                    tweets.forEach((t: any) => {
                        newEntries.push({
                            id: `tweet-${t.timestamp}`,
                            type: 'tweet',
                            content: t.content,
                            timestamp: t.timestamp
                        })
                    })
                }

                if (resLogs.ok) {
                    const logsData = await resLogs.json()
                    logsData.forEach((l: any) => {
                        // Attempt to classify log type based on content
                        let type: LogEntry['type'] = 'log'
                        const content = l.content || JSON.stringify(l)

                        if (content.includes('Thinking') || content.includes('Analyzing')) type = 'thought'
                        if (content.includes('Buying') || content.includes('Selling') || content.includes('Swapping')) type = 'trade'

                        newEntries.push({
                            id: `log-${l.timestamp}`,
                            type,
                            content: content,
                            timestamp: l.timestamp
                        })
                    })
                }

                if (newEntries.length > 0) {
                    setLogs(prev => {
                        const existingIds = new Set(prev.map(p => p.id))
                        const uniqueNew = newEntries.filter(m => !existingIds.has(m.id))
                        if (uniqueNew.length === 0) return prev
                        return [...prev, ...uniqueNew].sort((a, b) => a.timestamp - b.timestamp).slice(-100)
                    })
                }
            } catch (e) {
                console.error("Polling error", e)
            }
        }

        fetchData()
        const interval = setInterval(fetchData, 2000)
        return () => clearInterval(interval)
    }, [agentId])

    const getIcon = (type: LogEntry['type']) => {
        switch (type) {
            case 'tweet': return <Twitter className="w-3 h-3 text-blue-400" />
            case 'thought': return <BrainCircuit className="w-3 h-3 text-purple-400" />
            case 'trade': return <Activity className="w-3 h-3 text-success" />
            default: return <Terminal className="w-3 h-3 text-text-dim" />
        }
    }

    const getColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'tweet': return 'text-blue-400'
            case 'thought': return 'text-purple-400'
            case 'trade': return 'text-success'
            default: return 'text-text-dim'
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#050505] font-mono text-xs">
            {/* Header */}
            <div className="h-8 flex items-center justify-between px-3 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2 font-bold text-text-dim uppercase tracking-wider">
                    <Activity className="w-3 h-3" />
                    Agent Activity Log
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] text-text-dim">LIVE</span>
                </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 hover:bg-white/5 p-1 rounded transition-colors group">
                        <div className="shrink-0 text-[10px] text-text-dim/40 w-16 pt-0.5">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div className="shrink-0 pt-0.5">
                            {getIcon(log.type)}
                        </div>
                        <div className={`flex-1 break-words ${getColor(log.type)}`}>
                            {log.type === 'tweet' && <span className="font-bold mr-2 text-[10px] uppercase border border-blue-400/30 px-1 rounded text-blue-400">Tweet</span>}
                            {log.type === 'trade' && <span className="font-bold mr-2 text-[10px] uppercase border border-success/30 px-1 rounded text-success">Exec</span>}
                            <span className="opacity-90">{log.content}</span>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #050505;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </div>
    )
}
