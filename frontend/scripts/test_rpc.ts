import { createPublicClient, http } from 'viem'
import { bscTestnet } from 'viem/chains'

const RPCS = [
    'https://data-seed-prebsc-1-s1.binance.org:8545',
    'https://data-seed-prebsc-2-s1.binance.org:8545',
    'https://bsc-testnet.bnbchain.org',
    'https://bsc-testnet.publicnode.com',
    'https://bsc-testnet-rpc.publicnode.com',
    'https://api.zan.top/bsc-testnet',
    'https://bsc-testnet.public.blastapi.io'
]

const CONTRACT_ADDRESS = '0xB483e2320cEd721588a712289F9bab8aA79e0f55'

async function main() {
    console.log("Starting RPC Connectivity Test...")
    console.log(`Target Contract: ${CONTRACT_ADDRESS}`)

    const working = []

    for (const rpc of RPCS) {
        console.log(`Testing ${rpc}...`)
        try {
            const client = createPublicClient({
                chain: bscTestnet,
                transport: http(rpc, { timeout: 5000 })
            })

            const start = Date.now()
            const blockNumber = await client.getBlockNumber()
            const latency = Date.now() - start
            console.log(`SUCCESS: Connected! Block: ${blockNumber}, Latency: ${latency}ms`)

            // Check Contract
            const code = await client.getBytecode({ address: CONTRACT_ADDRESS })
            if (code && code.length > 2) {
                console.log(`CONTRACT FOUND: Bytecode length: ${code.length}`)
                working.push(rpc)
            } else {
                console.error(`CONTRACT MISSING at ${CONTRACT_ADDRESS}`)
            }

        } catch (e: any) {
            console.error(`FAILED: ${e.message?.slice(0, 50)}...`)
        }
    }

    console.log("\n--- SUMMARY OF WORKING RPCs ---")
    working.forEach(r => console.log(r))
    console.log("-------------------------------")
}

main().catch(console.error)
