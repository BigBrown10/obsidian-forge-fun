import 'dotenv/config'
import { Elysia } from 'elysia'
import { node } from '@elysiajs/node'
import { cors } from '@elysiajs/cors'
import { createPublicClient, http, parseAbiItem } from 'viem'
import { bscTestnet } from 'viem/chains'
import { AgentManager } from './AgentManager'

const LAUNCHPAD_ADDRESS = '0xD165568566c2dF451EbDBfd6C5DaA0CE88809e9B'
const AGENT_SKILL_REGISTRY_ADDRESS = '0x7831569341a8aa0288917D5F93Aa5DF97aa532bE'
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545'

// --- Viem Client ---
const publicClient = createPublicClient({
    chain: bscTestnet,
    transport: http(RPC_URL)
})

const agentManager = new AgentManager();

// --- Startup ---
const fetchAgents = async () => {
    try {
        console.log(`[INIT] Fetching agents via Count & Loop (Bypassing RPC Log Limits)...`);

        // 1. Get Total Count
        const count = await publicClient.readContract({
            address: LAUNCHPAD_ADDRESS,
            abi: [parseAbiItem('function proposalCount() view returns (uint256)')],
            functionName: 'proposalCount'
        }) as bigint

        console.log(`[INIT] Found ${count} total proposals.`);

        const agents = []

        // 2. Iterate and fetch details (Only latest 5)
        const start = Math.max(0, Number(count) - 5);
        console.log(`[INIT] Loading agents from index ${start} to ${count} (Latest 5)...`);

        for (let i = start; i < Number(count); i++) {
            try {
                const id = BigInt(i)

                // Fetch Proposal
                const data = await publicClient.readContract({
                    address: LAUNCHPAD_ADDRESS,
                    abi: [
                        parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
                    ],
                    functionName: 'proposals',
                    args: [id]
                })

                const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data as any
                const progress = Number(pledgedAmount) / Number(targetAmount) * 100

                // Fetch Skills (Default to [1] for now)
                let skills: number[] = [1]

                agents.push({
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
                    skills
                })
            } catch (err) {
                console.error(`Error loading agent ${i}`, err)
            }
        }

        const agentsList = agents.reverse()

        // Register agents
        agentsList.forEach(agent => {
            agentManager.registerAgent(agent)
            agentManager.updateEquippedSkills(agent.id, agent.skills);
        })

        return agentsList

    } catch (e) {
        console.error('Error fetching agents:', e)
        return []
    }
}

const app = new Elysia({ adapter: node() })
    .use(cors())
    .get('/', () => 'Hello from Forge.fun Backend (Obsidian Core)')
    .get('/health', () => 'OK') // K8s/OpenClaw Health Check
    .get('/api/agents', async () => {
        const agents = await fetchAgents()
        return agents
    })
    .get('/api/agents/:id', async ({ params: { id } }) => {
        // Fetch specific agent details 
        // For MVP, just reusing fetchAgents filter or readContract directly
        try {
            const data = await publicClient.readContract({
                address: LAUNCHPAD_ADDRESS,
                abi: [
                    parseAbiItem('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
                ],
                functionName: 'proposals',
                args: [BigInt(id)]
            })
            // serialize bigints
            const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data

            // Fetch Identity
            const identity = agentManager.getAgentIdentity(id);

            return {
                id,
                creator, name, ticker, metadataURI,
                targetAmount: targetAmount.toString(),
                pledgedAmount: pledgedAmount.toString(),
                createdAt: createdAt.toString(),
                launched, tokenAddress,
                identity // <--- Exposed here
            }
        } catch (e) {
            return { error: 'Agent not found' }
        }
    })
    .post('/agent/spawn', async ({ body }: { body: any }) => {
        const { agentId, manifest } = body;
        return await agentManager.spawnAgent(agentId, manifest);
    })
    .get('/api/agents/:id/tweets', async ({ params: { id } }) => {
        const tweets = await agentManager.twitterService.getTweets(id);
        // Include tweets from memory.
        return tweets;
    })
    .get('/api/agents/:id/logs', async ({ params: { id } }) => {
        const logs = agentManager.getLogs(id);
        return logs;
    })
    .post('/agent/hibernate', async ({ body }: { body: any }) => {
        const { agentId } = body;
        return await agentManager.hibernateAgent(agentId);
    })
    .post('/agent/veto-check', async ({ body }: { body: any }) => {
        const { pollId } = body;
        const passed = await agentManager.checkConsent(pollId);
        return { pollId, passed, timestamp: Date.now() };
    })
    .post('/api/sync-registry', async () => {
        console.log('[API] Force-syncing agent registry from chain...');
        const agents = await fetchAgents();
        return { success: true, count: agents.length };
    })
    // Phase 17: Training & Skills
    .post('/api/agents/:id/prompt', async ({ params: { id }, body }: { params: { id: string }, body: any }) => {
        console.log(`[API] Updating prompt for ${id}`);
        agentManager.updateRuntimePrompt(id, body.prompt);
        return { success: true };
    })
    .post('/api/agents/:id/skills', async ({ params: { id }, body }: { params: { id: string }, body: any }) => {
        console.log(`[API] Syncing skills for ${id}`);
        agentManager.updateEquippedSkills(id, body.skills);
        return { success: true };
    })
    .get('/api/skills', async () => {
        return agentManager.getAvailableSkills();
    })
    .listen(process.env.PORT || 3001)

fetchAgents().then(agents => {
    console.log(`[INIT] Hydrated ${agents.length} agents from on-chain.`);
});

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
