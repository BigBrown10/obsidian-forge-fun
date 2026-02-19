
import { createPublicClient, http, parseAbiItem } from 'viem';
import { bscTestnet } from 'viem/chains';
import 'dotenv/config';

const RPC_URL = process.env.RPC_URL || 'https://bsc-testnet.publicnode.com';
const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
});

const VAULT = '0x454b5ebdcdbf15e8a55eb1255c6c83cddf371dec';

async function run() {
    try {
        console.log(`Reading Proposal 0 from ${VAULT}...`);
        const data = await publicClient.readContract({
            address: VAULT as `0x${string}`,
            abi: [parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')],
            functionName: 'proposals',
            args: [0n]
        });
        console.log("Proposal Data:", data);
    } catch (e) {
        console.error("FAILED to read proposal:", e);
    }
}

run();
