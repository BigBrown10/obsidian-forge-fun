import { z } from 'zod'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { bscTestnet } from 'viem/chains'
import { LAUNCHPAD_ADDRESS } from './contracts'

// --- Zod Schemas ---
export const AgentSchema = z.object({
    id: z.string(),
    name: z.string(),
    ticker: z.string(),
    creator: z.string(),
    metadataURI: z.string().optional().default("{}"),
    targetAmount: z.string(),
    pledgedAmount: z.string(),
    bondingProgress: z.number(),
    launched: z.boolean(),
    tokenAddress: z.string().nullable().optional(), // Can be null if not launched
    createdAt: z.union([z.string(), z.number()]).transform(val => new Date(Number(val) * 1000).toISOString()).or(z.string()), // Handle unix timestamp or ISO string loops
    description: z.string().optional(),
    prompt: z.string().optional(),
    identity: z.object({
        email: z.string().optional(),
        username: z.string().optional(),
        platform: z.string().optional(),
    }).optional(),
    skills: z.array(z.number()).optional(),
    launchMode: z.string().optional(),
})

export type Agent = z.infer<typeof AgentSchema>

export const CreateAgentSchema = z.object({
    name: z.string().min(1, "Name is required").max(32, "Name must be under 32 characters"),
    ticker: z.string().min(1, "Ticker is required").max(8, "Ticker must be under 8 characters").regex(/^[A-Za-z0-9]+$/, "Ticker must be alphanumeric"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    agentType: z.string(),
    initialBuy: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, "Must be a valid positive number"),
    vaultPercent: z.number().min(10).max(90),
    marketingPercent: z.number().min(0).max(100),
    teamPercent: z.number().min(0).max(100),
    image: z.any().refine((file) => file instanceof File, "Image is required"),
    launchMode: z.enum(['instant', 'incubator']),
})

export type CreateAgentForm = z.infer<typeof CreateAgentSchema>

// --- API Functions ---

export async function getAgents(): Promise<Agent[]> {
    try {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 8000) // 8s timeout (increased for reliability)
        const res = await fetch('/api/agents', { signal: controller.signal })
        clearTimeout(timeout)

        if (!res.ok) throw new Error(`API Error: ${res.status}`)

        const rawData = await res.json()

        // Validate with Zod
        const parsed = z.array(AgentSchema).safeParse(rawData)

        if (!parsed.success) {
            console.error("API Validation Failed:", parsed.error)
            // Fallback: Try to return raw data but warn deeply, or filter out invalid ones
            // For resilience, we filter invalid items instead of crashing everything
            return (rawData as any[]).map(item => {
                // Manual patch for missing bondingProgress
                if (item.pledgedAmount && item.targetAmount) {
                    item.bondingProgress = Number(item.pledgedAmount) / Number(item.targetAmount) * 100
                }
                return item
            }) as Agent[]
        }

        return parsed.data
    } catch (error) {
        console.warn('API unreachable or invalid, falling back to empty list:', error)
        return []
    }
}

export async function getAgent(id: string): Promise<Agent | null> {
    try {
        const res = await fetch(`/api/agents/${id}`)
        if (!res.ok) return null
        const raw = await res.json()
        const parsed = AgentSchema.safeParse(raw)
        if (!parsed.success) return null
        return parsed.data
    } catch (error) {
        console.error(error)
        return null
    }
}

// --- Direct Chain Read Strategy ---
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
    } catch (e) {
        console.warn("Backend API failed, trying direct chain read...", e)
    }

    // 2. Slow Path (Direct Chain Read)
    console.log(`[DirectRead] Searching chain for ticker: ${ticker}`)
    try {
        const count = await publicClient.readContract({
            address: LAUNCHPAD_ADDRESS,
            abi: [parseAbiItem('function proposalCount() view returns (uint256)')],
            functionName: 'proposalCount'
        }) as bigint

        // Search limit: last 50 agents
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
                        skills: [1]
                    }
                }
            } catch (ignore) { }
        }
    } catch (e) {
        console.error("Direct chain read failed", e)
    }

    return null
}
