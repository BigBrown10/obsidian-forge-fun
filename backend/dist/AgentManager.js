"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentManager = void 0;
const AttestationService_1 = require("./services/AttestationService");
const LLMService_1 = require("./services/LLMService");
const TwitterService_1 = require("./services/TwitterService");
const BrowserService_1 = require("./services/BrowserService");
const IdentityService_1 = require("./services/IdentityService");
const TwitterSkill_1 = require("./skills/TwitterSkill");
const TraderSkill_1 = require("./skills/TraderSkill");
const EmailSkill_1 = require("./skills/EmailSkill");
class AgentManager {
    attestationService;
    llmService;
    twitterService; // Public for API access
    browserService;
    identityService;
    activeAgents = new Map(); // Store active agent "processes"
    loops = new Map();
    skillRegistry = new Map();
    constructor() {
        this.attestationService = new AttestationService_1.AttestationService();
        this.llmService = new LLMService_1.LLMService();
        this.twitterService = new TwitterService_1.TwitterService();
        this.browserService = new BrowserService_1.BrowserService();
        this.identityService = new IdentityService_1.IdentityService();
        // Register Skills
        this.registerSkill(new TwitterSkill_1.TwitterSkill(this.twitterService));
        this.registerSkill(new TraderSkill_1.TraderSkill());
        this.registerSkill(new EmailSkill_1.EmailSkill());
    }
    registerSkill(skill) {
        this.skillRegistry.set(skill.id, skill);
        console.log(`[SKILLS] Registered skill: ${skill.name} (ID: ${skill.id})`);
    }
    // Called when a new agent is detected on-chain
    registerAgent(agent) {
        if (this.activeAgents.has(agent.id))
            return;
        console.log("[INFO] Registering agent: " + agent.name + " (" + agent.ticker + ")");
        this.activeAgents.set(agent.id, agent);
        this.startAgentLoop(agent);
    }
    async spawnAgent(agentId, manifest) {
        console.log(`[SPAWN] Spawning agent ${agentId}...`);
        this.registerAgent({
            id: agentId,
            ...manifest
        });
        return { status: "spawned", agentId };
    }
    startAgentLoop(agent) {
        // Random start delay to stagger agents
        const delay = Math.random() * 10000;
        setTimeout(() => {
            console.log("[LOOP] Starting loop for " + agent.ticker);
            const interval = setInterval(() => this.agentTick(agent), 30000); // Wake up every 30s
            this.loops.set(agent.id, interval);
        }, delay);
    }
    async agentTick(agent) {
        console.log("[TICK] " + agent.ticker + " is waking up...");
        try {
            // Decide action based on skills & randomness
            // 70% chance to think/tweet, 30% to use a specialized skill if equipped
            const useSkill = Math.random() < 0.3 && agent.skills && agent.skills.length > 0;
            if (useSkill) {
                // Pick a random equipped skill
                const skillId = agent.skills[Math.floor(Math.random() * agent.skills.length)];
                const skill = this.skillRegistry.get(skillId);
                if (skill) {
                    console.log(`[SKILL: ${skill.name}] ${agent.ticker} executing...`);
                    // Simple input for now
                    const input = {
                        thought: await this.llmService.generateThought(agent.runtimePrompt || "Be yourself.", "status_update"),
                        image: null
                    };
                    const result = await skill.execute(agent, input);
                    console.log(`[SKILL: ${skill.name}] Result: ${result}`);
                    // TEE Sign the action
                    await this.attestationService.generateQuote(result);
                    return;
                }
            }
            if (false) { // Deprecated hardcoded browse logic
                console.log("[ACTION] " + agent.ticker + " decided to BROWSE the web.");
                const urls = ['https://example.com', 'https://google.com', 'https://wikipedia.org']; // Mock list
                const url = urls[Math.floor(Math.random() * urls.length)];
                // 1. Browse & Screenshot
                const { title, screenshot } = await this.browserService.visitAndScreenshot(url);
                const thought = `I just visited ${url}. The title is "${title}". The internet is fascinating!`;
                // 2. Sign (TEE)
                const quote = await this.attestationService.generateQuote(thought);
                // 3. Post with Image
                await this.twitterService.postTweet(agent.ticker, thought, screenshot);
                console.log("[POST] " + agent.ticker + " posted a screenshot of " + url);
            }
            else {
                // Normal Thinking Loop
                let prompt = "You are an AI agent.";
                if (agent.metadata) {
                    try {
                        const meta = JSON.parse(agent.metadata);
                        if (meta.prompt)
                            prompt = meta.prompt;
                    }
                    catch (e) { /* ignore json parse error */ }
                }
                const thought = await this.llmService.generateThought(prompt, "status_update");
                console.log("[THOUGHT] " + agent.ticker + ": " + thought);
                const quote = await this.attestationService.generateQuote(thought);
                const isValid = await this.attestationService.verifyQuote(quote, thought);
                if (!isValid) {
                    console.error("[ERROR] TEE Verification failed for " + agent.ticker + ". Suppressing thought.");
                    return;
                }
                await this.twitterService.postTweet(agent.ticker, thought);
                console.log("[POST] " + agent.ticker + " posted tweet.");
            }
        }
        catch (error) {
            console.error("Error in agent loop for " + agent.ticker + ":", error);
        }
    }
    async processAgentAction(agentId, actionPayload) {
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
    async hibernateAgent(agentId) {
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
    async checkConsent(pollId) {
        // Mock TEE Consent Check
        console.log(`[TEE] Checking consent for poll ${pollId}...`);
        return true; // Always pass for MVP
    }
    // --- Runtime Updates (Training & Skills) ---
    updateRuntimePrompt(agentId, prompt) {
        const agent = this.activeAgents.get(agentId);
        if (agent) {
            agent.runtimePrompt = prompt;
            console.log(`[TRAIN] Updated system prompt for ${agent.ticker}`);
        }
    }
    updateEquippedSkills(agentId, skills) {
        const agent = this.activeAgents.get(agentId);
        if (agent) {
            agent.skills = skills;
            console.log(`[SKILLS] Updated skills for ${agent.ticker}:`, skills);
        }
    }
}
exports.AgentManager = AgentManager;
