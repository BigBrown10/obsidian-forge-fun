import React, { useState, useEffect, useRef } from 'react'
import { Send, User, Bot, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Message {
    id: string
    sender: string
    content: string
    timestamp: number
    isSystem?: boolean
    isMe?: boolean
}

export default function ChatBox({ agentId, ticker }: { agentId: string, ticker: string }) {
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', sender: 'System', content: `Channel open for $${ticker}`, timestamp: Date.now(), isSystem: true }
    ])
    const [inputValue, setInputValue] = useState('')
    const bottomRef = useRef<HTMLDivElement>(null)

    // Auto-scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Poll for real System Logs & Tweets
    useEffect(() => {
        if (!agentId) return

        const fetchLogs = async () => {
            try {
                // Parallel fetch
                const [resTweets, resLogs] = await Promise.all([
                    fetch(`/api/agents/${agentId}/tweets`),
                    fetch(`/api/agents/${agentId}/logs`)
                ])

                const newMessages: Message[] = []

                if (resTweets.ok) {
                    const tweets = await resTweets.json()
                    tweets.forEach((t: any) => {
                        newMessages.push({
                            id: `tweet-${t.timestamp}`,
                            sender: 'Agent', // Or agent name
                            content: t.content,
                            timestamp: t.timestamp,
                            isSystem: false
                        })
                    })
                }

                if (resLogs.ok) {
                    const logs = await resLogs.json()
                    logs.forEach((l: any) => {
                        newMessages.push({
                            id: `log-${l.timestamp}`,
                            sender: 'System',
                            content: `LOG: ${l.content || JSON.stringify(l)}`,
                            timestamp: l.timestamp,
                            isSystem: true
                        })
                    })
                }

                if (newMessages.length > 0) {
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(p => p.id))
                        const uniqueNew = newMessages.filter(m => !existingIds.has(m.id))
                        if (uniqueNew.length === 0) return prev
                        return [...prev, ...uniqueNew].sort((a, b) => a.timestamp - b.timestamp).slice(-50)
                    })
                }

            } catch (e) {
                console.error("Chat polling error", e)
            }
        }

        fetchLogs()
        const interval = setInterval(fetchLogs, 4000)
        return () => clearInterval(interval)
    }, [agentId])

    // Mock incoming messages (Public Chat simulation)
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.8) { // Reduced freq
                const names = ['CryptoKing', 'WAGMI_Warrior', 'BscGemHunter', 'AlphaSeeker']
                const msgs = ['LFG! 🚀', 'Buying the dip', 'Is this dev based?', 'Chart looking bullish', 'When moon?']

                addMessage({
                    id: Date.now().toString(),
                    sender: names[Math.floor(Math.random() * names.length)],
                    content: msgs[Math.floor(Math.random() * msgs.length)],
                    timestamp: Date.now()
                })
            }
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    const addMessage = (msg: Message) => {
        setMessages(prev => [...prev.slice(-50), msg]) // Keep last 50
    }

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!inputValue.trim()) return

        addMessage({
            id: Date.now().toString(),
            sender: 'You',
            content: inputValue,
            timestamp: Date.now(),
            isMe: true
        })
        setInputValue('')
    }

    return (
        <div className="flex flex-col h-full bg-[#050505] border-l border-white/5">
            {/* Header */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-text-dim uppercase tracking-wider">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Live Chat
                </div>
                <div className="text-[10px] text-text-dim font-mono">
                    {messages.length} msgs
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                        {msg.isSystem ? (
                            <div className="w-full text-center my-2">
                                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-text-dim uppercase">{msg.content}</span>
                            </div>
                        ) : (
                            <div className={`max-w-[85%] ${msg.isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`flex items-baseline gap-2 mb-0.5 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                    <span className={`font-bold ${msg.isMe ? 'text-accent' : 'text-text-secondary'}`}>{msg.sender}</span>
                                    <span className="text-[10px] text-text-dim/50">{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={`px-3 py-2 rounded-xl border ${msg.isMe ? 'bg-accent/10 border-accent/20 text-white rounded-tr-none' : 'bg-white/5 border-white/5 text-text-dim rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 border-t border-white/5 bg-black/20">
                <div className="relative">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Say something..."
                        className="w-full bg-[#111] border border-white/10 rounded-lg pl-3 pr-10 py-2.5 text-xs text-white placeholder-text-dim/50 focus:border-accent/50 outline-none transition-colors"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10 text-accent disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </form>
        </div>
    )
}
