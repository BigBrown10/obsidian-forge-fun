import { NextResponse } from 'next/server'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { bscTestnet } from 'viem/chains'
import { LAUNCHPAD_ADDRESS } from '@/lib/contracts'

const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
})

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    try {
        const data = await publicClient.readContract({
            address: LAUNCHPAD_ADDRESS,
            abi: [
                parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
            ],
            functionName: 'proposals',
            args: [BigInt(id)]
        })

        const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data
        const progress = Number(pledgedAmount) / Number(targetAmount) * 100

        // Try to parse metadata if it's JSON
        let description = ''
        let prompt = ''
        try {
            const meta = JSON.parse(metadataURI)
            description = meta.description || ''
            prompt = meta.prompt || ''
        } catch (e) {
            // metadata might be a raw string or IPFS hash
            description = metadataURI
        }

        const agent = {
            id,
            creator, name, ticker,
            description, prompt,
            targetAmount: targetAmount.toString(),
            pledgedAmount: pledgedAmount.toString(),
            bondingProgress: Math.min(progress, 100),
            launched, tokenAddress,
            createdAt: new Date(Number(createdAt) * 1000).toISOString()
        }

        return NextResponse.json(agent)
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Agent not found' }, { status: 404 })
    }
}
