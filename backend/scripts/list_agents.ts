import { createPublicClient, http, parseAbiItem, formatEther } from 'viem'
import { bscTestnet } from 'viem/chains'

// CORRECT Address from frontend/src/lib/contracts.ts
const LAUNCHPAD_ADDRESS = '0xB483e2320cEd721588a712289F9bab8aA79e0f55'
const RPC_URL = 'https://bsc-testnet.publicnode.com'

const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
})

async function main() {
    console.log(`🔍 Querying ForgeLaunchpad at ${LAUNCHPAD_ADDRESS}...`)

    try {
        const count = await publicClient.readContract({
            address: LAUNCHPAD_ADDRESS,
            abi: [parseAbiItem('function proposalCount() view returns (uint256)')],
            functionName: 'proposalCount'
        }) as bigint

        console.log(`✅ Total Proposals: ${count}`)

        if (Number(count) === 0) {
            console.log("No agents found.")
            return
        }

        const start = Math.max(0, Number(count) - 5)
        console.log(`Fetching latest 5 agents (Index ${start} to ${count})...`)

        for (let i = start; i < Number(count); i++) {
            const data = await publicClient.readContract({
                address: LAUNCHPAD_ADDRESS,
                abi: [
                    parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
                ],
                functionName: 'proposals',
                args: [BigInt(i)]
            }) as any

            const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data

            console.log(`\n--- Agent #${i} ---`)
            console.log(`Name: ${name} ($${ticker})`)
            console.log(`Creator: ${creator}`)
            console.log(`Launched: ${launched}`)
            console.log(`Target: ${formatEther(targetAmount)} BNB`)
            console.log(`Pledged: ${formatEther(pledgedAmount)} BNB`)
            console.log(`Metadata: ${metadataURI}`)
        }

    } catch (e) {
        console.error("❌ Error querying contract:", e)
    }
}

main()
