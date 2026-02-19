import 'dotenv/config'
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import { websocket } from '@elysiajs/websocket'
import { createPublicClient, http, parseAbiItem, decodeEventLog } from 'viem'
import { bscTestnet } from 'viem/chains'
import { AgentManager } from './AgentManager'

const INSTANT_LAUNCHER_ADDRESS = process.env.INSTANT_LAUNCHER_ADDRESS as `0x${string}`
const INCUBATOR_VAULT_ADDRESS = process.env.INCUBATOR_VAULT_ADDRESS as `0x${string}`
const AGENT_SKILL_REGISTRY_ADDRESS = process.env.AGENT_SKILL_REGISTRY_ADDRESS as `0x${string}`
const RPC_URL = process.env.RPC_URL || 'https://bsc-testnet.publicnode.com'

const LEGACY_LAUNCHERS = (process.env.LEGACY_LAUNCHERS || '').split(',').filter(Boolean) as `0x${string}`[]
const LEGACY_VAULTS = (process.env.LEGACY_VAULTS || '').split(',').filter(Boolean) as `0x${string}`[]

// --- Viem Client ---
const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
})

const agentManager = new AgentManager();

// --- Registry Helpers ---
const registerLegacyAgent = (tokenAddress: string, data: any) => {
    if (agentManager.activeAgents.has(tokenAddress)) return;

    agentManager.registerAgent({
        id: tokenAddress,
        name: data.name || data.ticker || "Legacy Agent",
        ticker: data.ticker || "LEGACY",
        creator: data.creator,
        metadataURI: data.metadataURI || JSON.stringify({
            name: data.name || data.ticker,
            ticker: data.ticker,
            image: `https://api.dicebear.com/7.x/identicon/svg?seed=${data.ticker || tokenAddress}`
        }),
        targetAmount: '0',
        pledgedAmount: data.raisedAmount?.toString() || '0',
        bondingProgress: 100,
        launched: true,
        tokenAddress,
        createdAt: Math.floor(Date.now() / 1000),
        skills: [1],
        service_origin: data.origin || 'legacy-instant'
    }, true); // SKIP BOOT during hydration
};

// --- Startup Hydration ---
const fetchAgents = async () => {
    try {
        console.log(`[INIT] Hydrating Agent Registry...`);
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 300000n; // ~10 days historical scan

        // 1. Fetch Incubator Agents (Stateful - All versions)
        const vaults = [INCUBATOR_VAULT_ADDRESS, ...LEGACY_VAULTS];
        console.log(`[INIT] Scanning for Incubator Proposals from ${vaults.length} vaults...`);

        for (const vault of vaults) {
            try {
                const count = await publicClient.readContract({
                    address: vault as `0x${string}`,
                    abi: [parseAbiItem('function proposalCount() view returns (uint256)')],
                    functionName: 'proposalCount'
                }) as bigint;

                for (let i = 0n; i < count; i++) {
                    try {
                        const data = await publicClient.readContract({
                            address: vault as `0x${string}`,
                            abi: [parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')],
                            functionName: 'proposals',
                            args: [i]
                        });
                        const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data as any;
                        agentManager.registerAgent({
                            id: `${vault}-${i}`,
                            name, ticker, creator, metadataURI,
                            targetAmount: targetAmount.toString(),
                            pledgedAmount: pledgedAmount.toString(),
                            bondingProgress: Math.min((Number(pledgedAmount) / Number(targetAmount) * 100), 100),
                            launched, tokenAddress,
                            createdAt: Number(createdAt),
                            skills: [1],
                            service_origin: 'incubator'
                        }, true); // SKIP BOOT during hydration
                    } catch (e) { }
                }
            } catch (err) {
                console.warn(`[INIT] Failed scanning incubator ${vault}:`, err);
            }
        }

        // 2. Fetch Instant Launches (All versions with Chunking)
        const launchers = [INSTANT_LAUNCHER_ADDRESS, ...LEGACY_LAUNCHERS];
        const chunkSize = 1000n; // Micro-chunks for extreme RPC stability

        console.log(`[INIT] Scanning for Instant Launches (Range: ${fromBlock.toString()} to ${currentBlock.toString()})...`);

        for (const launcher of launchers) {
            try {
                // Apple-standard "LIFO" Logic: Scan from current to past
                let currentTo = currentBlock;
                while (currentTo > fromBlock) {
                    const currentFrom = currentTo - chunkSize < fromBlock ? fromBlock : currentTo - chunkSize;

                    let retryCount = 0;
                    const maxRetries = 5;
                    let logs: any[] = [];
                    let legacyLogs: any[] = [];
                    let success = false;

                    while (retryCount < maxRetries && !success) {
                        try {
                            logs = await publicClient.getLogs({
                                address: launcher as `0x${string}`,
                                event: parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string name, string ticker, string metadataURI, uint256 raisedAmount)'),
                                fromBlock: currentFrom,
                                toBlock: currentTo
                            });

                            legacyLogs = await publicClient.getLogs({
                                address: launcher as `0x${string}`,
                                event: parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string ticker, uint256 raisedAmount)'),
                                fromBlock: currentFrom,
                                toBlock: currentTo
                            });
                            success = true;
                        } catch (chunkErr) {
                            retryCount++;
                            console.warn(`[INIT] Retry ${retryCount}/${maxRetries} for chunk ${currentFrom}-${currentTo} on ${launcher}`);
                            if (retryCount < maxRetries) await new Promise(r => setTimeout(r, 5000));
                        }
                    }

                    if (success) {
                        for (const log of logs) {
                            const { tokenAddress, creator, name, ticker, metadataURI, raisedAmount } = (log as any).args;
                            registerLegacyAgent(tokenAddress, { name, ticker, creator, metadataURI, raisedAmount, origin: 'instant' });
                        }
                        for (const log of legacyLogs) {
                            const { tokenAddress, creator, ticker, raisedAmount } = (log as any).args;
                            registerLegacyAgent(tokenAddress, { ticker, creator, raisedAmount, origin: 'legacy-instant' });
                        }
                    } else {
                        console.error(`[INIT] FATAL: Failed chunk ${currentFrom}-${currentTo} after ${maxRetries} retries.`);
                    }
                    currentTo = currentFrom - 1n; // Move backwards
                }
            } catch (err) {
                console.warn(`[INIT] Failed scanning launcher ${launcher}:`, err);
            }
        }

        return Array.from(agentManager.activeAgents.values());
    } catch (e) {
        console.error('Error fetching agents:', e)
        return []
    }
}

const app = new Elysia({ adapter: node() })
    .use(cors())
    .use(websocket())
    .ws('/ws', {
        open(ws) {
            console.log(`[WS] Client connected`);
            ws.subscribe('agent-updates');
        },
        message(ws, message) {
            console.log(`[WS] Received: ${message}`);
        },
        close(ws) {
            console.log(`[WS] Client disconnected`);
        }
    })
    .get('/', () => 'Hello from Forge.fun Backend (Obsidian Core)')
    .get('/health', () => 'OK')
    .get('/api/agents', async () => {
        return Array.from(agentManager.activeAgents.values()).reverse();
    })
    .get('/api/agents/:id', async (context) => {
        const id = context.params.id;
        if (agentManager.activeAgents.has(id)) {
            return agentManager.activeAgents.get(id);
        }
        try {
            // Attempt fallback to Incubator Vault by ID
            const data = await publicClient.readContract({
                address: INCUBATOR_VAULT_ADDRESS,
                abi: [parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')],
                functionName: 'proposals',
                args: [BigInt(id)]
            })
            const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data as any
            const agent = {
                id, creator, name, ticker, metadataURI,
                targetAmount: targetAmount.toString(),
                pledgedAmount: pledgedAmount.toString(),
                bondingProgress: Math.min((Number(pledgedAmount) / Number(targetAmount) * 100), 100),
                createdAt: Number(createdAt),
                launched, tokenAddress,
                identity: agentManager.getAgentIdentity(id),
                skills: [1],
                service_origin: 'incubator'
            }
            agentManager.registerAgent(agent);
            return agent;
        } catch (e) {
            return { error: 'Agent not found' }
        }
    })
    .get('/api/agents/:id/tweets', async (context) => {
        const id = context.params.id;
        return await agentManager.twitterService.getTweets(id);
    })
    .get('/api/agents/:id/logs', async (context) => {
        const id = context.params.id;
        return agentManager.getLogs(id);
    })
    .post('/api/sync-registry', async () => {
        const agents = await fetchAgents();
        return { success: true, count: agents.length };
    })
    .get('/api/debug', async () => {
        const currentBlock = await publicClient.getBlockNumber();
        return {
            instant_launcher: INSTANT_LAUNCHER_ADDRESS,
            incubator_vault: INCUBATOR_VAULT_ADDRESS,
            current_block: currentBlock.toString(),
            agent_count: agentManager.activeAgents.size,
            agents: Array.from(agentManager.activeAgents.keys())
        }
    })
    .post('/api/agents/manual-register', async ({ body }: { body: any }) => {
        agentManager.registerAgent(body);
        return { success: true };
    })
    .post('/api/sync-tx', async ({ body }: { body: any }) => {
        const { txHash } = body;
        try {
            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash as `0x${string}` });

            // Detect Instant Launch
            const instantLaunchAbi = parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string name, string ticker, string metadataURI, uint256 raisedAmount)');
            for (const log of receipt.logs) {
                try {
                    const decoded = decodeEventLog({ abi: [instantLaunchAbi as any], data: log.data, topics: log.topics }) as any;
                    if (decoded.eventName === 'InstantLaunch') {
                        const { tokenAddress, creator, name, ticker, metadataURI, raisedAmount } = decoded.args;
                        const agent = {
                            id: tokenAddress, name, ticker, creator, metadataURI,
                            targetAmount: '0', pledgedAmount: raisedAmount.toString(),
                            bondingProgress: 100, launched: true, tokenAddress,
                            createdAt: Math.floor(Date.now() / 1000), service_origin: 'instant'
                        };
                        agentManager.registerAgent(agent);
                        return { success: true, mode: 'instant', agent };
                    }
                } catch (e) { }
            }

            // Detect Incubator Proposal
            const proposalCreatedAbi = parseAbiItem('event ProposalCreated(uint256 indexed id, string name, string ticker, address indexed creator)');
            for (const log of receipt.logs) {
                try {
                    const decoded = decodeEventLog({ abi: [proposalCreatedAbi as any], data: log.data, topics: log.topics }) as any;
                    if (decoded.eventName === 'ProposalCreated') {
                        const id = decoded.args.id.toString();
                        const data = await publicClient.readContract({
                            address: INCUBATOR_VAULT_ADDRESS,
                            abi: [parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')],
                            functionName: 'proposals',
                            args: [BigInt(id)]
                        });
                        const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data as any;
                        const agent = {
                            id, creator, name, ticker, metadataURI,
                            targetAmount: targetAmount.toString(), pledgedAmount: pledgedAmount.toString(),
                            bondingProgress: Math.min((Number(pledgedAmount) / Number(targetAmount) * 100), 100),
                            createdAt: Number(createdAt),
                            launched, tokenAddress, service_origin: 'incubator'
                        };
                        agentManager.registerAgent(agent);
                        return { success: true, mode: 'incubator', agent };
                    }
                } catch (e) { }
            }
            return { success: false, error: "No relevant events found" };
        } catch (e: any) {
            return { success: false, error: e.toString() };
        }
    })
    .listen({
        port: process.env.PORT || 3001,
        hostname: '0.0.0.0'
    })

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

// Watchers & Background Polling
publicClient.watchContractEvent({
    address: [
        INSTANT_LAUNCHER_ADDRESS as `0x${string}`,
        INCUBATOR_VAULT_ADDRESS as `0x${string}`,
        ...LEGACY_LAUNCHERS,
        ...LEGACY_VAULTS
    ],
    abi: [
        parseAbiItem('event Launched(uint256 indexed id, address tokenAddress, uint256 raisedAmount)'),
        parseAbiItem('event ProposalCreated(uint256 indexed id, string name, string ticker, address indexed creator)'),
        parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string name, string ticker, string metadataURI, uint256 raisedAmount)'),
        parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string ticker, uint256 raisedAmount)')
    ],
    onLogs: async (logs) => {
        console.log(`[EVENT] Detected ${logs.length} on-chain events. Syncing...`);
        await fetchAgents();

        // Broadcast the news to all WS clients
        const agents = Array.from(agentManager.activeAgents.values()).reverse();
        app.server?.publish('agent-updates', JSON.stringify({
            type: 'AGENTS_UPDATED',
            agents: agents.slice(0, 50) // Send latest 50
        }));
    }
});

fetchAgents();
setInterval(fetchAgents, 10000);
