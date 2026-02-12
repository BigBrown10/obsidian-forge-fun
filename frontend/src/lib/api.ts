// Removed self import

// type export removed

export async function getAgents(): Promise<Agent[]> {
    try {
        const res = await fetch('/api/agents')
        if (!res.ok) throw new Error('Failed to fetch agents')
        return await res.json()
    } catch (error) {
        console.error(error)
        return []
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
