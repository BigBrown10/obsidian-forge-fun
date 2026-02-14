// Removed self import

// type export removed

// --- MOCK DATA ---
const MOCK_AGENTS: Agent[] = [
    {
        id: 'mock-1',
        name: 'Kekius Maximus',
        ticker: 'KEK',
        creator: '0x123...456',
        metadataURI: JSON.stringify({ description: "The supreme commander of the memes. 100% autonomous, 100% dank.", image: "https://api.dicebear.com/9.x/pixel-art/svg?seed=KEK" }),
        targetAmount: '10',
        pledgedAmount: '8.5',
        bondingProgress: 85,
        launched: false,
        tokenAddress: '0x...',
        createdAt: new Date().toISOString()
    },
    {
        id: 'mock-2',
        name: 'Based GigaChad',
        ticker: 'CHAD',
        creator: '0xabc...def',
        metadataURI: JSON.stringify({ description: "Takes no prisoners. Only up only. The AI that trades with pure conviction.", image: "https://api.dicebear.com/9.x/pixel-art/svg?seed=CHAD" }),
        targetAmount: '20',
        pledgedAmount: '20',
        bondingProgress: 100,
        launched: true,
        tokenAddress: '0x789...012',
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 'mock-3',
        name: 'Cyber Oracle',
        ticker: 'ORCL',
        creator: '0x456...789',
        metadataURI: JSON.stringify({ description: "Predicts market movements using quantum flux algorithms. Do not question the Oracle.", image: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ORCL" }),
        targetAmount: '15',
        pledgedAmount: '2.1',
        bondingProgress: 14,
        launched: false,
        tokenAddress: '0x...',
        createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 'mock-4',
        name: 'Doge AI',
        ticker: 'DAI',
        creator: '0x999...999',
        metadataURI: JSON.stringify({ description: "Much intelligence. Very artificial. Wow.", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=DAI" }),
        targetAmount: '5',
        pledgedAmount: '4.9',
        bondingProgress: 98,
        launched: false,
        tokenAddress: '0x...',
        createdAt: new Date(Date.now() - 100000).toISOString()
    },
    {
        id: 'mock-5',
        name: 'Neural Ninja',
        ticker: 'NINJA',
        creator: '0xaaa...bbb',
        metadataURI: JSON.stringify({ description: "Silent assassin of the order book. Front-runs the front-runners.", image: "https://api.dicebear.com/9.x/notionists/svg?seed=NINJA" }),
        targetAmount: '50',
        pledgedAmount: '12',
        bondingProgress: 24,
        launched: false,
        tokenAddress: '0x...',
        createdAt: new Date(Date.now() - 7200000).toISOString()
    }
]

export async function getAgents(): Promise<Agent[]> {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000) // 4s timeout
        const res = await fetch('/api/agents', { signal: controller.signal })
        clearTimeout(timeout)
        if (!res.ok) throw new Error('Failed to fetch agents')
        const realAgents = await res.json()
        // Ensure bondingProgress exists on real agents
        const normalized = realAgents.map((a: any) => ({
            ...a,
            bondingProgress: a.bondingProgress ?? (Number(a.pledgedAmount) / Number(a.targetAmount) * 100)
        }))
        return [...normalized, ...MOCK_AGENTS]
    } catch (error) {
        console.error('API unreachable, using mock data:', error)
        return MOCK_AGENTS
    }
}

export async function getAgent(id: string): Promise<Agent | null> {
    try {
        const res = await fetch(`/api/agents/${id}`)
        if (!res.ok) return null
        return await res.json()
    } catch (error) {
        console.error(error)
        return null
    }
}

export async function getAgentByTicker(ticker: string): Promise<Agent | null> {
    const agents = await getAgents()
    return agents.find(a => a.ticker.toLowerCase() === ticker.toLowerCase()) || null
}

export interface Agent {
    id: string
    name: string
    ticker: string
    creator: string
    metadataURI: string
    targetAmount: string
    pledgedAmount: string
    bondingProgress: number
    launched: boolean
    tokenAddress: string
    createdAt: string
    description?: string
    prompt?: string
}
