import { createPublicClient, http, parseAbiItem } from 'viem'
import { bscTestnet } from 'viem/chains'
const LAUNCHPAD_ADDRESS = '0xB483e2320cEd721588a712289F9bab8aA79e0f55'
const client = createPublicClient({ chain: bscTestnet, transport: http('https://bsc-testnet.publicnode.com') })
async function main() {
    try {
        const count = await client.readContract({ address: LAUNCHPAD_ADDRESS, abi: [parseAbiItem('function proposalCount() view returns (uint256)')], functionName: 'proposalCount' }) as bigint
        console.log(`COUNT: ${count}`)
        if (count > 0n) {
            const last = await client.readContract({ address: LAUNCHPAD_ADDRESS, abi: [parseAbiItem('function proposals(uint256) view returns (address, string name, string ticker, string, uint256, uint256, uint256, bool, address)')], functionName: 'proposals', args: [count - 1n] }) as any
            console.log(`LAST AGENT: ${last[1]} ($${last[2]})`)
        }
    } catch (e) {
        console.error(e)
    }
}
main()
