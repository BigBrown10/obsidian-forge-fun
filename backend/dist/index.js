"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elysia_1 = require("elysia");
const cors_1 = require("@elysiajs/cors");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const AgentManager_1 = require("./AgentManager");
// --- Configuration ---
const LAUNCHPAD_ADDRESS = '0xD165568566c2dF451EbDBfd6C5DaA0CE88809e9B';
const RPC_URL = 'https://data-seed-prebsc-1-s1.binance.org:8545';
// --- Viem Client ---
const publicClient = (0, viem_1.createPublicClient)({
    chain: chains_1.bscTestnet,
    transport: (0, viem_1.http)(RPC_URL)
});
const agentManager = new AgentManager_1.AgentManager();
// --- Startup ---
const fetchAgents = async () => {
    try {
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - 5000n; // Look back ~5000 blocks
        console.log(`[INIT] Fetching agents from block ${fromBlock} to ${currentBlock}...`);
        const logs = await publicClient.getLogs({
            address: LAUNCHPAD_ADDRESS,
            event: (0, viem_1.parseAbiItem)('event AgentLaunched(uint256 indexed id, string name, string ticker, address creator, string metadata)'),
            fromBlock: fromBlock,
            toBlock: 'latest'
        });
        const agents = await Promise.all(logs.map(async (log) => {
            const id = log.args.id;
            // Fetch details from contract: proposals(id)
            const data = await publicClient.readContract({
                address: LAUNCHPAD_ADDRESS,
                abi: [
                    (0, viem_1.parseAbiItem)('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
                ],
                functionName: 'proposals',
                args: [id]
            });
            const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data;
            // Calculate progress
            const progress = Number(pledgedAmount) / Number(targetAmount) * 100;
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
            };
        }));
        const agentsList = agents.reverse(); // Newest first
        // Register agents to start their autonomous loops
        agentsList.forEach(agent => {
            agentManager.registerAgent(agent);
        });
        return agentsList;
    }
    catch (e) {
        console.error('Error fetching agents:', e);
        return [];
    }
};
const app = new elysia_1.Elysia()
    .use((0, cors_1.cors)())
    .get('/', () => 'Hello from Forge.fun Backend (Obsidian Core)')
    .get('/api/agents', async () => {
    const agents = await fetchAgents();
    return agents;
})
    .get('/api/agents/:id', async ({ params: { id } }) => {
    // Fetch specific agent details 
    // For MVP, just reusing fetchAgents filter or readContract directly
    try {
        const data = await publicClient.readContract({
            address: LAUNCHPAD_ADDRESS,
            abi: [
                (0, viem_1.parseAbiItem)('function proposals(uint256) view returns (address creator, string name, string ticker, string metadataURI, uint256 targetAmount, uint256 pledgedAmount, uint256 createdAt, bool launched, address tokenAddress)')
            ],
            functionName: 'proposals',
            args: [BigInt(id)]
        });
        // serialize bigints
        const [creator, name, ticker, metadataURI, targetAmount, pledgedAmount, createdAt, launched, tokenAddress] = data;
        return {
            id,
            creator, name, ticker, metadataURI,
            targetAmount: targetAmount.toString(),
            pledgedAmount: pledgedAmount.toString(),
            createdAt: createdAt.toString(),
            launched, tokenAddress
        };
    }
    catch (e) {
        return { error: 'Agent not found' };
    }
})
    .post('/agent/spawn', async ({ body }) => {
    const { agentId, manifest } = body;
    return await agentManager.spawnAgent(agentId, manifest);
})
    .get('/api/agents/:id/tweets', async ({ params: { id } }) => {
    const tweets = await agentManager.twitterService.getTweets(id);
    // Include tweets from memory.
    return tweets;
})
    .post('/agent/hibernate', async ({ body }) => {
    const { agentId } = body;
    return await agentManager.hibernateAgent(agentId);
})
    .post('/agent/veto-check', async ({ body }) => {
    const { pollId } = body;
    const passed = await agentManager.checkConsent(pollId);
    return { pollId, passed, timestamp: Date.now() };
})
    // Phase 17: Training & Skills
    .post('/api/agents/:id/prompt', async ({ params: { id }, body }) => {
    console.log(`[API] Updating prompt for ${id}`);
    agentManager.updateRuntimePrompt(id, body.prompt);
    return { success: true };
})
    .post('/api/agents/:id/skills', async ({ params: { id }, body }) => {
    console.log(`[API] Syncing skills for ${id}`);
    agentManager.updateEquippedSkills(id, body.skills);
    return { success: true };
})
    .listen(3000);
console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
