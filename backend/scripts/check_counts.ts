
import { createPublicClient, http, parseAbiItem } from 'viem';
import { bscTestnet } from 'viem/chains';
import 'dotenv/config';

const RPC_URL = process.env.RPC_URL || 'https://bsc-testnet.publicnode.com';
const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
});

const INSTANT_LAUNCHER = '0x21de3907cf959aa28711712a447b4504e6142556';
const LEGACY_LAUNCHERS = ['0x849D1B9A3E4f63525cc592935d8F0af6fEb406A6', '0x3ea391992afd3f39BE19679214357e215a4B2d2c'];
const VAULTS = ['0x454b5ebdcdbf15e8a55eb1255c6c83cddf371dec', '0x1c22090F25A3c4285Dd58bd020Ee5e0a9782157f'];

async function run() {
    console.log("--- SCANNING CONTRACT STATE ---");

    for (const vault of VAULTS) {
        try {
            const count = await publicClient.readContract({
                address: vault as `0x${string}`,
                abi: [parseAbiItem('function proposalCount() view returns (uint256)')],
                functionName: 'proposalCount'
            }) as bigint;
            console.log(`Vault ${vault}: ${count} Proposals`);
        } catch (e) {
            console.log(`Vault ${vault}: FAILED (likely not a vault or RPC error)`);
        }
    }

    const currentBlock = await publicClient.getBlockNumber();
    console.log(`Current Block: ${currentBlock}`);

    for (const launcher of [INSTANT_LAUNCHER, ...LEGACY_LAUNCHERS]) {
        try {
            const logs = await publicClient.getLogs({
                address: launcher as `0x${string}`,
                event: parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string name, string ticker, string metadataURI, uint256 raisedAmount)'),
                fromBlock: currentBlock - 50000n,
                toBlock: currentBlock
            });
            console.log(`Launcher ${launcher}: ${logs.length} launches in last 50k blocks`);
        } catch (e) {
            console.log(`Launcher ${launcher}: FAILED log scan`);
        }
    }
}

run();
