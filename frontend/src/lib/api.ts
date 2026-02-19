// Removed self import

// type export removed

export async function getAgents(): Promise<Agent[]> {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 4000) // 4s timeout
        const res = await fetch('/api/agents', { signal: controller.signal })
        clearTimeout(timeout)
        if (!res.ok) throw new Error('Failed to fetch agents')
        const realAgents = await res.json()
        // Ensure bondingProgress exists on real agents
        return realAgents.map((a: any) => ({
            ...a,
            bondingProgress: a.bondingProgress ?? (Number(a.pledgedAmount) / Number(a.targetAmount) * 100)
        }))
    } catch (error) {
        console.error('API unreachable:', error)
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


// --- Direct Chain Read Strategy ---
import { createPublicClient, http, parseAbiItem } from 'viem'
import { bscTestnet } from 'viem/chains'
import { LAUNCHPAD_ADDRESS } from './contracts'

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http('https://bsc-testnet.publicnode.com')
})

export async function getAgentByTicker(ticker: string): Promise<Agent | null> {
    // 1. Try Fast Path (Backend API)
    try {
        const agents = await getAgents()
        const found = agents.find(a => a.ticker.toLowerCase() === ticker.toLowerCase())
        if (found) return found
    } catch (e) { console.warn("Backend API failed, trying direct chain read...", e) }

    // 2. Slow Path (Direct Chain Read) - "The Instant Fallback"
    console.log(`[DirectRead] Searching chain for ticker: ${ticker}...`)
    try {
        // Get total count
        const count = await publicClient.readContract({
            address: LAUNCHPAD_ADDRESS,
            abi: [parseAbiItem('function proposalCount() view returns (uint256)')],
            functionName: 'proposalCount'
        }) as bigint

        // Iterate backwards (newest first) to find the ticker
        // Search limit: last 50 agents to prevent browser hang
        const searchLimit = 50;
        const start = Number(count) - 1;
        const end = Math.max(0, start - searchLimit);

        for (let i = start; i >= end; i--) {
            try {
                const data = await publicClient.readContract({
                    address: LAUNCHPAD_ADDRESS,
                    abi: [
                        parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
                    ],
                    functionName: 'proposals',
                    args: [BigInt(i)]
                }) as any

                const [creator, name, chainTicker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data

                if (chainTicker.toLowerCase() === ticker.toLowerCase()) {
                    console.log(`[DirectRead] Found agent on-chain! ID: ${i}`)
                    // Construct Agent Object
                    return {
                        id: i.toString(),
                        name,
                        ticker: chainTicker,
                        creator,
                        metadataURI,
                        targetAmount: targetAmount.toString(),
                        pledgedAmount: pledgedAmount.toString(),
                        bondingProgress: Math.min((Number(pledgedAmount) / Number(targetAmount) * 100), 100),
                        launched,
                        tokenAddress,
                        createdAt: new Date(Number(createdAt) * 1000).toISOString(),
                        skills: [1] // Default
                    }
                }
            } catch (ignore) { }
        }
    } catch (e) {
        console.error("Direct chain read failed", e)
    }

    return null
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
    identity?: {
        email: string
        username: string
        platform: string
    }
    skills?: number[]
}
