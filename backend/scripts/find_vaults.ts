
import { createPublicClient, http, parseAbiItem } from 'viem';
import { bscTestnet } from 'viem/chains';
import 'dotenv/config';

const RPC_URL = process.env.RPC_URL || 'https://bsc-testnet.publicnode.com';
const pc = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
});

async function run() {
    try {
        const current = await pc.getBlockNumber();
        console.log(`Scanning last 10k blocks starting from ${current}...`);

        for (let i = 0; i < 5; i++) {
            const to = current - BigInt(i * 2000);
            const from = to - 2000n;
            console.log(`Scanning range ${from} to ${to}...`);
            try {
                const logs = await pc.getLogs({
                    event: parseAbiItem('event ProposalCreated(uint256 indexed id, address indexed creator, string name, string ticker)'),
                    fromBlock: from,
                    toBlock: to
                });
                for (const log of logs) {
                    console.log(`FOUND VAULT: ${log.address} | ID: ${(log.args as any).id} | Ticker: ${(log.args as any).ticker}`);
                }
            } catch (e) {
                console.warn(`Chunk skip: ${e.message}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
}

run();
