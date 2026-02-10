'use client'

import { useState } from 'react'

export default function Forge() {
    const [method, setMethod] = useState<'ghost' | 'instant'>('ghost')

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-obsidian text-white">
            <h1 className="text-4xl font-mono mb-8 text-electricPurple">THE FORGE</h1>

            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl mb-12">
                <button
                    onClick={() => setMethod('ghost')}
                    className={`p-6 border rounded-xl text-left ${method === 'ghost' ? 'border-electricPurple bg-electricPurple/10' : 'border-gray-700'}`}
                >
                    <h2 className="text-2xl font-bold mb-2">Ghost Proposal</h2>
                    <p className="text-sm text-gray-400">Crowdfund the agent's birth. Users pledge BNB. If target met, agent awakens.</p>
                </button>
                <button
                    onClick={() => setMethod('instant')}
                    className={`p-6 border rounded-xl text-left ${method === 'instant' ? 'border-electricPurple bg-electricPurple/10' : 'border-gray-700'}`}
                >
                    <h2 className="text-2xl font-bold mb-2">Instant Awakening</h2>
                    <p className="text-sm text-gray-400">Pay the full cost (5 BNB) yourself. Skip the line. Immediate Genesis.</p>
                </button>
            </div>

            <form className="w-full max-w-xl space-y-6">
                <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">AGENT NAME</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 focus:border-electricPurple outline-none" placeholder="e.g. Agent Smith" />
                </div>
                <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">TICKER</label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-3 focus:border-electricPurple outline-none" placeholder="$SMITH" />
                </div>
                <div>
                    <label className="block text-sm font-mono text-gray-400 mb-2">SYSTEM PROMPT (THE SOUL)</label>
                    <textarea className="w-full bg-gray-900 border border-gray-700 rounded p-3 h-32 focus:border-electricPurple outline-none" placeholder="You are an autonomous agent..." />
                </div>

                <button className="w-full bg-electricPurple hover:bg-purple-600 text-black font-bold py-4 rounded font-mono mt-8">
                    {method === 'ghost' ? 'INITIATE GHOST PROTOCOL (0.01 BNB)' : 'IGNITE GENESIS (5.0 BNB)'}
                </button>
            </form>
        </main>
    )
}
