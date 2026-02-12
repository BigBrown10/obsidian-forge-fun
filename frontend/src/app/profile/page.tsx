'use client'

import { useState } from 'react'
import { MOCK_TOKENS, formatMarketCap } from '../../data/mock'

export default function Profile() {
    const [tab, setTab] = useState<'holdings' | 'created' | 'activity'>('holdings')

    const walletAddress = '0x7a3B...4f2E'
    const holdingTokens = MOCK_TOKENS.slice(0, 4)
    const createdTokens = MOCK_TOKENS.slice(0, 2)

    return (
        <div className="min-h-full">
            <div className="max-w-4xl mx-auto px-5 py-8">
                {/* Profile header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-card border border-border-subtle flex items-center justify-center text-2xl">
                        ◉
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">{walletAddress}</h1>
                        <p className="text-sm text-text-secondary mt-0.5">Joined 2 weeks ago · 12 trades</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6">
                    {(['holdings', 'created', 'activity'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${tab === t ? 'bg-accent text-black' : 'text-text-secondary hover:text-text-primary hover:bg-card'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {tab === 'holdings' && (
                    <div className="space-y-3">
                        {holdingTokens.map((token) => (
                            <div key={token.id} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-card hover:bg-card-hover transition-colors">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-black"
                                        style={{ background: token.color }}
                                    >
                                        {token.ticker.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">{token.name}</div>
                                        <div className="text-xs text-text-dim font-mono">${token.ticker}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-mono font-medium">{formatMarketCap(token.marketCap)}</div>
                                    <div className={`text-xs font-mono ${token.priceChange24h >= 0 ? 'text-accent' : 'text-danger'}`}>
                                        {token.priceChange24h >= 0 ? '+' : ''}{token.priceChange24h}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'created' && (
                    <div className="space-y-3">
                        {createdTokens.map((token) => (
                            <div key={token.id} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-card">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold text-black"
                                        style={{ background: token.color }}
                                    >
                                        {token.ticker.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">{token.name}</div>
                                        <div className="text-xs text-text-dim font-mono">${token.ticker}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-text-secondary">{token.replies} holders</div>
                            </div>
                        ))}
                    </div>
                )}

                {tab === 'activity' && (
                    <div className="space-y-3">
                        {['Bought 0.5 BNB of $PFORGE', 'Sold 0.2 BNB of $ALPHA', 'Created agent YieldMaster', 'Voted YES on Proposal #102'].map((activity, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle bg-card">
                                <span className="text-sm text-text-secondary">{activity}</span>
                                <span className="text-xs text-text-dim">{i + 1}h ago</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
