import 'dotenv/config'
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import { createPublicClient, http, parseAbiItem, decodeEventLog } from 'viem'
import { bscTestnet } from 'viem/chains'
import { AgentManager } from './AgentManager'

const INSTANT_LAUNCHER_ADDRESS = '0x56c9caA37773055d2e5cFA2814af5B738D70c5D6'
const INCUBATOR_VAULT_ADDRESS = '0xCf7C1caCd2900947006306fAbCb3658e236222D6'
const AGENT_SKILL_REGISTRY_ADDRESS = '0x7831569341a8aa0288917D5F93Aa5DF97aa532bE'
const RPC_URL = 'https://bsc-testnet.publicnode.com'

// --- Viem Client ---
const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
})

const agentManager = new AgentManager();

// --- Startup Hydration ---
const fetchAgents = async () => {
    try {
        console.log(`[INIT] Hydrating Agent Registry...`);

        // 1. Fetch Incubator Agents (Stateful)
        const incubatorCount = await publicClient.readContract({
            address: INCUBATOR_VAULT_ADDRESS,
            abi: [parseAbiItem('function proposalCount() view returns (uint256)')],
            functionName: 'proposalCount'
        }) as bigint

        const start = Math.max(0, Number(incubatorCount) - 50);
        for (let i = start; i < Number(incubatorCount); i++) {
            try {
                const id = BigInt(i)
                const data = await publicClient.readContract({
                    address: INCUBATOR_VAULT_ADDRESS,
                    abi: [
                        parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
                    ],
                    functionName: 'proposals',
                    args: [id]
                })

                const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data as any
                const progress = Number(pledgedAmount) / Number(targetAmount) * 100

                agentManager.registerAgent({
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
                    createdAt: new Date(Number(createdAt) * 1000).toISOString(),
                    skills: [1],
                    service_origin: 'incubator'
                })
            } catch (err) { }
        }

        // 2. Fetch Instant Agents (Event-driven)
        const instantLogs = await publicClient.getLogs({
            address: INSTANT_LAUNCHER_ADDRESS,
            event: parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string ticker, uint256 raisedAmount)'),
            fromBlock: 'earliest'
        })

        for (const log of instantLogs) {
            const { tokenAddress, creator, ticker, raisedAmount } = (log as any).args;
            if (!agentManager.activeAgents.has(tokenAddress)) {
                agentManager.registerAgent({
                    id: tokenAddress,
                    name: ticker,
                    ticker,
                    creator,
                    metadataURI: '{}',
                    targetAmount: '0',
                    pledgedAmount: raisedAmount.toString(),
                    bondingProgress: 100,
                    launched: true,
                    tokenAddress,
                    createdAt: new Date().toISOString(),
                    skills: [1],
                    service_origin: 'instant'
                })
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
    .get('/', () => 'Hello from Forge.fun Backend (Obsidian Core)')
    .get('/health', () => 'OK')
    .get('/api/agents', async () => {
        return Array.from(agentManager.activeAgents.values()).reverse();
    })
    .get('/api/agents/:id', async ({ params: { id } }) => {
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
                createdAt: new Date(Number(createdAt) * 1000).toISOString(),
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
    .get('/api/agents/:id/tweets', async ({ params: { id } }) => {
        return await agentManager.twitterService.getTweets(id);
    })
    .get('/api/agents/:id/logs', async ({ params: { id } }) => {
        return agentManager.getLogs(id);
    })
    .post('/api/sync-registry', async () => {
        const agents = await fetchAgents();
        return { success: true, count: agents.length };
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
            const instantLaunchAbi = parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string ticker, uint256 raisedAmount)');
            for (const log of receipt.logs) {
                try {
                    const decoded = decodeEventLog({ abi: [instantLaunchAbi as any], data: log.data, topics: log.topics }) as any;
                    if (decoded.eventName === 'InstantLaunch') {
                        const { tokenAddress, creator, ticker, raisedAmount } = decoded.args;
                        const agent = {
                            id: tokenAddress, name: ticker, ticker, creator, metadataURI: '{}',
                            targetAmount: '0', pledgedAmount: raisedAmount.toString(),
                            bondingProgress: 100, launched: true, tokenAddress,
                            createdAt: new Date().toISOString(), service_origin: 'instant'
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
                            createdAt: new Date(Number(createdAt) * 1000).toISOString(),
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
    .listen(process.env.PORT || 3001)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)

// Watchers & Background Polling
publicClient.watchContractEvent({
    address: [INSTANT_LAUNCHER_ADDRESS as `0x${string}`, INCUBATOR_VAULT_ADDRESS as `0x${string}`],
    abi: [
        parseAbiItem('event Launched(uint256 indexed id, address tokenAddress, uint256 raisedAmount)'),
        parseAbiItem('event ProposalCreated(uint256 indexed id, string name, string ticker, address indexed creator)'),
        parseAbiItem('event InstantLaunch(address indexed tokenAddress, address indexed creator, string ticker, uint256 raisedAmount)')
    ],
    onLogs: () => fetchAgents()
});

fetchAgents();
setInterval(fetchAgents, 10000);
