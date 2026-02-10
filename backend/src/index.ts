import { Elysia } from 'elysia'
import { AgentManager } from './AgentManager'

const agentManager = new AgentManager();

const app = new Elysia()
    .get('/', () => 'Hello from Forge.fun Backend (Obsidian Core)')
    .post('/agent/spawn', async ({ body }: { body: any }) => {
        const { agentId, manifest } = body;
        return await agentManager.spawnAgent(agentId, manifest);
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
    .listen(3000)

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`)
