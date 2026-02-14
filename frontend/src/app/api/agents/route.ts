import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic' // Ensure real-time data
import { createPublicClient, http, parseAbiItem } from 'viem'
import { bscTestnet } from 'viem/chains'
import { LAUNCHPAD_ADDRESS } from '@/lib/contracts'

const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
})

export async function GET() {
    try {
        const logs = await publicClient.getLogs({
            address: LAUNCHPAD_ADDRESS,
            event: parseAbiItem('event ProposalCreated(uint256 indexed id, address indexed creator, string name, uint256 target)'),
            fromBlock: 'earliest',
            toBlock: 'latest'
        })

        const agents = await Promise.all(logs.map(async (log) => {
            const id = log.args.id!
            const data = await publicClient.readContract({
                address: LAUNCHPAD_ADDRESS,
                abi: [
                    parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
                ],
                functionName: 'proposals',
                args: [id]
            })

            const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data
            const progress = Number(pledgedAmount) / Number(targetAmount) * 100

            return {
                id: id.toString(),
                name,
                ticker,
                creator,
                metadataURI,
                targetAmount: targetAmount.toString(),
                pledgedAmount: pledgedAmount.toString(),
                bondingProgress: Math.min(progress, 100),
                launched,
                tokenAddress,
                createdAt: new Date(Number(createdAt) * 1000).toISOString()
            }
        }))

        return NextResponse.json(agents.reverse())
    } catch (error) {
        console.error('API Error:', error)
        return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 })
    }
}
