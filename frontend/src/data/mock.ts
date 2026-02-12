export interface Token {
    id: string
    name: string
    ticker: string
    description: string
    creator: string
    marketCap: number
    priceChange24h: number
    bondingProgress: number
    createdAt: string
    replies: number
    color: string
}

export const MOCK_TOKENS: Token[] = [
    {
        id: '1',
        name: 'PepeForge',
        ticker: 'PFORGE',
        description: 'The first autonomous meme agent on BNB Chain. Runs X raids, posts alpha, never sleeps.',
        creator: '0x7a3B...4f2E',
        marketCap: 142500,
        priceChange24h: 34.2,
        bondingProgress: 78,
        createdAt: '2m ago',
        replies: 47,
        color: '#4ade80',
    },
    {
        id: '2',
        name: 'AlphaHunter',
        ticker: 'ALPHA',
        description: 'Scans 200+ Telegram groups for early calls. Auto-buys based on sentiment analysis.',
        creator: '0x1c9D...8bA3',
        marketCap: 89300,
        priceChange24h: -8.1,
        bondingProgress: 45,
        createdAt: '5m ago',
        replies: 23,
        color: '#f472b6',
    },
    {
        id: '3',
        name: 'YieldMaster',
        ticker: 'YIELD',
        description: 'Auto-compounds yield across 15 DeFi protocols. Community-governed strategy changes.',
        creator: '0xbE42...1dCc',
        marketCap: 234800,
        priceChange24h: 12.7,
        bondingProgress: 92,
        createdAt: '12m ago',
        replies: 89,
        color: '#a78bfa',
    },
    {
        id: '4',
        name: 'ShibaAgent',
        ticker: 'SAGENT',
        description: 'Doge-themed agent that monitors whale wallets and tweets their moves in real-time.',
        creator: '0x3fA7...9e2B',
        marketCap: 67200,
        priceChange24h: 156.4,
        bondingProgress: 34,
        createdAt: '1m ago',
        replies: 112,
        color: '#fb923c',
    },
    {
        id: '5',
        name: 'NewsBot',
        ticker: 'NEWS',
        description: 'Aggregates and summarizes crypto news from 50+ sources. Posts hourly digests.',
        creator: '0xd8F1...3cE7',
        marketCap: 45100,
        priceChange24h: 5.3,
        bondingProgress: 22,
        createdAt: '18m ago',
        replies: 15,
        color: '#38bdf8',
    },
    {
        id: '6',
        name: 'TradeSignal',
        ticker: 'TSIG',
        description: 'Technical analysis agent. Identifies breakout patterns and posts trade setups.',
        creator: '0x92aB...7fD4',
        marketCap: 178400,
        priceChange24h: -3.2,
        bondingProgress: 65,
        createdAt: '8m ago',
        replies: 56,
        color: '#facc15',
    },
    {
        id: '7',
        name: 'GigaBrain',
        ticker: 'GIGA',
        description: 'Multi-chain research agent. Writes deep-dive threads on new protocols.',
        creator: '0x5eC3...2aF8',
        marketCap: 312000,
        priceChange24h: 22.8,
        bondingProgress: 88,
        createdAt: '3m ago',
        replies: 201,
        color: '#e879f9',
    },
    {
        id: '8',
        name: 'MemeFactory',
        ticker: 'MFACT',
        description: 'Generates meme images based on trending topics. Posts to X every 30 minutes.',
        creator: '0xaB67...4c1D',
        marketCap: 53700,
        priceChange24h: 87.5,
        bondingProgress: 41,
        createdAt: '6m ago',
        replies: 34,
        color: '#f87171',
    },
    {
        id: '9',
        name: 'WhaleWatch',
        ticker: 'WHALE',
        description: 'Tracks wallets holding >$1M. Sends alerts when they move funds.',
        creator: '0x1dE9...8bC2',
        marketCap: 98600,
        priceChange24h: 1.4,
        bondingProgress: 53,
        createdAt: '14m ago',
        replies: 42,
        color: '#2dd4bf',
    },
]

export const MOCK_COMMENTS = [
    { user: '0x7a3B...4f2E', text: 'This agent is printing. +30% in an hour.', time: '2m ago' },
    { user: '0x1c9D...8bA3', text: 'Bonding curve almost full, get in before migration.', time: '5m ago' },
    { user: '0xbE42...1dCc', text: 'Dev is based. Agent already has 2k followers on X.', time: '8m ago' },
    { user: '0x3fA7...9e2B', text: 'Just aped 0.5 BNB. LFG', time: '12m ago' },
    { user: '0xd8F1...3cE7', text: 'Chart looking bullish. Higher lows forming.', time: '15m ago' },
]

export const MOCK_PROPOSALS = [
    {
        id: '1',
        title: 'Increase posting frequency to every 15 minutes',
        agent: 'PepeForge',
        yesPercent: 72,
        noPercent: 28,
        totalVotes: 156,
        endsIn: '4h 23m',
        status: 'active' as const,
    },
    {
        id: '2',
        title: 'Hire @NewsBot for real-time news integration',
        agent: 'AlphaHunter',
        yesPercent: 45,
        noPercent: 55,
        totalVotes: 89,
        endsIn: '1d 2h',
        status: 'active' as const,
    },
    {
        id: '3',
        title: 'Allocate 0.5 BNB from gas tank for premium X features',
        agent: 'GigaBrain',
        yesPercent: 88,
        noPercent: 12,
        totalVotes: 234,
        endsIn: '12m',
        status: 'active' as const,
    },
]

export function formatMarketCap(mc: number): string {
    if (mc >= 1_000_000) return `$${(mc / 1_000_000).toFixed(1)}M`
    if (mc >= 1_000) return `$${(mc / 1_000).toFixed(1)}K`
    return `$${mc}`
}
