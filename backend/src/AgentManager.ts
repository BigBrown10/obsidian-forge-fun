
import { AttestationService } from './services/AttestationService';
import { LLMService } from './services/LLMService';
import { TwitterService } from './services/TwitterService';
import { BrowserService } from './services/BrowserService';
import { IdentityService } from './services/IdentityService';
import { ISkill } from './skills/ISkill';
import { TwitterSkill } from './skills/TwitterSkill';
import { TraderSkill } from './skills/TraderSkill';
import { EmailSkill } from './skills/EmailSkill';

export class AgentManager {
    private attestationService: AttestationService;
    private llmService: LLMService;
    public twitterService: TwitterService; // Public for API access
    private browserService: BrowserService;
    private identityService: IdentityService;
    private activeAgents: Map<string, any> = new Map(); // Store active agent "processes"
    private loops: Map<string, NodeJS.Timeout> = new Map();
    private skillRegistry: Map<number, ISkill> = new Map();

    private logs: Map<string, { type: string, msg: string, timestamp: number }[]> = new Map();

    constructor() {
        this.attestationService = new AttestationService();
        this.llmService = new LLMService();
        this.twitterService = new TwitterService();
        this.browserService = new BrowserService();
        this.identityService = new IdentityService();

        // Wire up Real Twitter
        this.twitterService.setBrowserService(this.browserService);

        // Register Skills
        this.registerSkill(new TwitterSkill(this.twitterService));
        this.registerSkill(new TraderSkill());
        this.registerSkill(new EmailSkill());
    }

    private registerSkill(skill: ISkill) {
        this.skillRegistry.set(skill.id, skill);
        console.log(`[SKILLS] Registered skill: ${skill.name} (ID: ${skill.id})`);
    }

    // Called when a new agent is detected on-chain
    public registerAgent(agent: any) {
        if (this.activeAgents.has(agent.id)) return;

        this.addLog(agent.id, "INFO", `Agent registered: ${agent.name} (${agent.ticker})`);
        this.activeAgents.set(agent.id, agent);
        this.startAgentLoop(agent);
    }

    public async spawnAgent(agentId: string, manifest: any) {
        console.log(`[SPAWN] Spawning agent ${agentId}...`);
        this.registerAgent({
            id: agentId,
            ...manifest
        });
        return { status: "spawned", agentId };
    }

    private startAgentLoop(agent: any) {
        // Random start delay to stagger agents
        const delay = Math.random() * 10000;

        setTimeout(() => {
            this.addLog(agent.id, "LOOP", "Starting autonomous loop...");
            const interval = setInterval(() => this.agentTick(agent), 30000); // Wake up every 30s
            this.loops.set(agent.id, interval);
        }, delay);
    }

    private async agentTick(agent: any) {
        this.addLog(agent.id, "TICK", "Waking up...");

        try {
            // Decide action based on skills & randomness
            // 70% chance to think/tweet, 30% to use a specialized skill if equipped

            const useSkill = Math.random() < 0.3 && agent.skills && agent.skills.length > 0;

            if (useSkill) {
                // Pick a random equipped skill
                const skillId = agent.skills[Math.floor(Math.random() * agent.skills.length)];
                const skill = this.skillRegistry.get(skillId);

                if (skill) {
                    this.addLog(agent.id, "EXEC", `Executing skill: ${skill.name}...`);

                    // Simple input for now
                    const input = {
                        thought: await this.llmService.generateThought(agent.runtimePrompt || "Be yourself.", "status_update"),
                        image: null
                    };

                    const result = await skill.execute(agent, input);
                    this.addLog(agent.id, "SKILL", `Result: ${result}`);

                    // TEE Sign the action
                    await this.attestationService.generateQuote(result);
                    return;
                }
            }

            // Normal Thinking Loop
            let prompt = "You are an AI agent.";
            if (agent.metadata) {
                try {
                    const meta = JSON.parse(agent.metadata);
                    if (meta.prompt) prompt = meta.prompt;
                } catch (e) { /* ignore json parse error */ }
            }

            const thought = await this.llmService.generateThought(prompt, "status_update");
            this.addLog(agent.id, "THOUGHT", thought);

            const quote = await this.attestationService.generateQuote(thought);

            const isValid = await this.attestationService.verifyQuote(quote, thought);
            if (!isValid) {
                this.addLog(agent.id, "ERROR", "TEE Verification failed. Suppressing thought.");
                return;
            }

            await this.twitterService.postTweet(agent.ticker, thought);
            this.addLog(agent.id, "POST", "Tweet published to social feed.");

        } catch (error) {
            console.error("Error in agent loop for " + agent.ticker + ":", error);
            this.addLog(agent.id, "ERROR", "Loop exception occurred.");
        }
    }

    // --- Logging Helper ---
    private addLog(agentId: string, type: string, msg: string) {
        const entry = { type, msg, timestamp: Date.now() };
        const agentLogs = this.logs.get(agentId) || [];
        agentLogs.unshift(entry);
        if (agentLogs.length > 50) agentLogs.pop();
        this.logs.set(agentId, agentLogs);

        // Also echo to stdout for debugging
        const ticker = this.activeAgents.get(agentId)?.ticker || agentId;
        console.log(`[${type}] ${ticker}: ${msg}`);
    }

    public getLogs(agentId: string) {
        return this.logs.get(agentId) || [];
    }

    async processAgentAction(agentId: string, actionPayload: string) {
        console.log("Processing action for agent " + agentId + "...");

        // 1. Generate TEE Quote (Consent-to-Spend)
        const quote = await this.attestationService.generateQuote(actionPayload);
        console.log("🔒 Generated TEE Quote:", quote);

        // 2. Verify Quote (simulating on-chain verification)
        const isValid = await this.attestationService.verifyQuote(quote, actionPayload);
        if (!isValid) {
            console.error("❌ TEE Quote Verification Failed! Action blocked.");
            return;
        }

        console.log("✅ TEE Attestation Verified. Executing action...");
        // ... execute action (e.g. sign transaction) ...
    }

    public async hibernateAgent(agentId: string) {
        console.log(`[HIBERNATE] Stopping agent ${agentId}...`);
        const loop = this.loops.get(agentId);
        if (loop) {
            clearInterval(loop);
            this.loops.delete(agentId);
            this.activeAgents.delete(agentId);
            return { status: "hibernating", agentId };
        }
        return { status: "not_found", agentId };
    }

    public async checkConsent(pollId: string) {
        // Mock TEE Consent Check
        console.log(`[TEE] Checking consent for poll ${pollId}...`);
        return true; // Always pass for MVP
    }


    // --- Runtime Updates (Training & Skills) ---
    public updateRuntimePrompt(agentId: string, prompt: string) {
        const agent = this.activeAgents.get(agentId);
        if (agent) {
            agent.runtimePrompt = prompt;
            console.log(`[TRAIN] Updated system prompt for ${agent.ticker}`);
        }
    }

    public updateEquippedSkills(agentId: string, skills: number[]) {
        const agent = this.activeAgents.get(agentId);
        if (agent) {
            agent.skills = skills;
            console.log(`[SKILLS] Updated skills for ${agent.ticker}:`, skills);
        }
    }
}
