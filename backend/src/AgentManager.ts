
import { AttestationService } from './services/AttestationService';
import { LLMService } from './services/LLMService';
import { TwitterService } from './services/TwitterService';
import { BrowserService } from './services/BrowserService';
import { IdentityService } from './services/IdentityService';
import { ISkill } from './skills/ISkill';

// Original Skills
import { TwitterSkill } from './skills/TwitterSkill';
import { TraderSkill } from './skills/TraderSkill';
import { EmailSkill } from './skills/EmailSkill';
import { AccountCreationSkill } from './skills/AccountCreationSkill';

// Crypto & DeFi Skills
import { SniperSkill } from './skills/SniperSkill';
import { DexTraderSkill } from './skills/DexTraderSkill';
import { WhaleWatcherSkill } from './skills/WhaleWatcherSkill';
import { PortfolioSkill } from './skills/PortfolioSkill';
import { SentimentSkill } from './skills/SentimentSkill';
import { HoneypotDetectorSkill } from './skills/HoneypotDetectorSkill';
import { GasOptimizerSkill } from './skills/GasOptimizerSkill';
import { CopyTraderSkill } from './skills/CopyTraderSkill';

// Social & Communication Skills
import { TwitterEngagementSkill } from './skills/TwitterEngagementSkill';
import { TwitterAnalyticsSkill } from './skills/TwitterAnalyticsSkill';
import { TelegramSkill } from './skills/TelegramSkill';
import { DiscordSkill } from './skills/DiscordSkill';
import { MixpostSchedulerSkill } from './skills/MixpostSchedulerSkill';

// Business & Productivity Skills
import { AgentMailSkill } from './skills/AgentMailSkill';
import { GitHubManagerSkill } from './skills/GitHubManagerSkill';
import { KnowledgeBaseSkill } from './skills/KnowledgeBaseSkill';
import { WorkflowBuilderSkill } from './skills/WorkflowBuilderSkill';

// Utility Skills
import { WebScraperSkill } from './skills/WebScraperSkill';
import { ShellCommanderSkill } from './skills/ShellCommanderSkill';
import { SchedulerSkill } from './skills/SchedulerSkill';
import { FileManagerSkill } from './skills/FileManagerSkill';

// Hidden Gem Skills
import { SkillVetterSkill } from './skills/SkillVetterSkill';
import { SelfImproverSkill } from './skills/SelfImproverSkill';
import { NarrativeWriterSkill } from './skills/NarrativeWriterSkill';
import { AlphaRadarSkill } from './skills/AlphaRadarSkill';
import { SoftwareDevSkill } from './skills/SoftwareDevSkill';

export class AgentManager {
    private attestationService: AttestationService;
    private llmService: LLMService;
    public twitterService: TwitterService; // Public for API access
    private browserService: BrowserService;
    private identityService: IdentityService;
    public activeAgents: Map<string, any> = new Map(); // Store active agent "processes"
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
        this.twitterService.setIdentityService(this.identityService);

        // ═══════════════════════════════════════════════
        //  REGISTER ALL 25 SKILLS
        // ═══════════════════════════════════════════════

        // Original Skills (IDs 1-4)
        this.registerSkill(new TwitterSkill(this.twitterService));             // 1
        this.registerSkill(new TraderSkill());                                  // 2
        this.registerSkill(new AccountCreationSkill(this.identityService, this.browserService)); // 3
        this.registerSkill(new EmailSkill());                                   // 4

        // Crypto & DeFi Skills (IDs 5-12)
        this.registerSkill(new SniperSkill());                                  // 5
        this.registerSkill(new DexTraderSkill());                               // 6
        this.registerSkill(new WhaleWatcherSkill());                            // 7
        this.registerSkill(new PortfolioSkill());                               // 8
        this.registerSkill(new SentimentSkill(this.llmService));                // 9
        this.registerSkill(new HoneypotDetectorSkill());                        // 10
        this.registerSkill(new GasOptimizerSkill());                            // 11
        this.registerSkill(new CopyTraderSkill());                              // 12

        // Social & Communication Skills (IDs 13-19)
        this.registerSkill(new TwitterEngagementSkill(this.llmService, this.twitterService)); // 13
        this.registerSkill(new TwitterAnalyticsSkill());                        // 14
        this.registerSkill(new TelegramSkill());                                // 15
        this.registerSkill(new DiscordSkill());                                 // 16
        this.registerSkill(new WebScraperSkill());                              // 17
        this.registerSkill(new SchedulerSkill());                               // 18
        this.registerSkill(new MixpostSchedulerSkill());                        // 19

        // Business & Productivity Skills (IDs 20-25)
        this.registerSkill(new AgentMailSkill());                               // 20
        this.registerSkill(new GitHubManagerSkill());                           // 21
        this.registerSkill(new KnowledgeBaseSkill());                           // 22
        this.registerSkill(new WorkflowBuilderSkill());                         // 23
        this.registerSkill(new ShellCommanderSkill());                          // 24
        this.registerSkill(new FileManagerSkill());                             // 25

        // Hidden Gem Skills (IDs 26-29)
        this.registerSkill(new SkillVetterSkill());                             // 26
        this.registerSkill(new SelfImproverSkill(this.llmService));             // 27
        this.registerSkill(new NarrativeWriterSkill(this.llmService));          // 28
        this.registerSkill(new AlphaRadarSkill(this.llmService));               // 29
        this.registerSkill(new SoftwareDevSkill(this.llmService));               // 30

        console.log(`[SKILLS] ═══ ${this.skillRegistry.size} total skills registered ═══`);
    }

    private registerSkill(skill: ISkill) {
        this.skillRegistry.set(skill.id, skill);
        console.log(`[SKILLS] Registered skill: ${skill.name} (ID: ${skill.id})`);
    }

    // Called when a new agent is detected on-chain
    registerAgent(agent: any) {
        if (this.activeAgents.has(agent.id)) return;

        // ---------------------------------------------------------
        // METADATA PARSING & MIGRATION LOGIC
        // ---------------------------------------------------------
        let metadata: any = {};
        try {
            metadata = agent.metadataURI && agent.metadataURI.startsWith('{') ? JSON.parse(agent.metadataURI) : {};
        } catch (e) {
            console.error(`[AGENT] Metadata parse error for ${agent.ticker}:`, e);
        }

        // Determine Launch Mode (Strict Separation)
        let launchMode = metadata.launchMode;
        if (!launchMode) {
            launchMode = agent.launched ? 'instant' : 'incubator';
        }

        // Ensure name and ticker are sanitized
        agent.name = agent.name || metadata.name || agent.ticker || "Unknown Agent";
        agent.ticker = agent.ticker || metadata.ticker || "UNKNOWN";
        agent.metadataURI = agent.metadataURI || "{}";

        // Ensure image fallback (Failover Logic)
        if (!metadata.image) {
            metadata.image = `https://api.dicebear.com/7.x/identicon/svg?seed=${agent.ticker}`;
            agent.metadataURI = JSON.stringify(metadata);
        }

        // Inject the strictly typed mode into the agent object
        agent.launchMode = launchMode;
        agent.service_origin = agent.service_origin || (launchMode === 'instant' ? 'instant' : 'incubator');

        // CROSS-SERVICE VISIBILITY: Explicitly ensure no filters block this
        agent.is_visible = true;
        agent.metadata = metadata;

        this.activeAgents.set(agent.id, agent);

        // ---------------------------------------------------------
        // BEHAVIORAL LOGIC
        // ---------------------------------------------------------

        // CASE 1: INCUBATOR (Not Launched)
        // - Incubator agents are DORMANT. They accept pledges but do NOT run loops/skills.
        if (launchMode === 'incubator' && !agent.launched) {
            console.log(`🥚 Agent Registered (INCUBATOR): ${agent.name} (${agent.ticker}) - DORMANT`);
            this.addLog(agent.id, "STATUS", "Agent is in incubation. Systems dormant until launch.");
            return;
        }

        // CASE 2: INCUBATOR (Launched) OR INSTANT (Launched or Not)
        // - "Instant" agents are ALWAYS "live" in terms of looping/skills, even if the 'launched' bool is false momentarily on-chain.
        // - "Incubator" agents that ARE 'launched' = true are now LIVE.

        // Trigger Boot Sequence for "Awakening" feel
        this.bootAgent(agent);

        this.startAgentLoop(agent);
        console.log(`🤖 Agent Registered (${launchMode.toUpperCase()}): ${agent.name} (${agent.ticker})`);
    }

    spawnAgent(agentId: string, manifest: any) {
        const agent = {
            id: agentId,
            ...manifest,
        };
        this.activeAgents.set(agentId, agent);
        this.bootAgent(agent);
        this.startAgentLoop(agent);
        return agent;
    }

    private async bootAgent(agent: any) {
        // Prevent rebooting if already has logs (simple check)
        if (this.logs.has(agent.id) && this.logs.get(agent.id)!.length > 0) return;

        console.log(`[BOOT] Waking up ${agent.ticker}...`);
        this.addLog(agent.id, "BOOT", "System kernel initializing...");

        await new Promise(r => setTimeout(r, 1000));
        this.addLog(agent.id, "IDENTITY", "Verifying secure persona...");

        // Ensure Identity matches
        let identity = this.identityService.getIdentity(agent.ticker);
        if (!identity) {
            this.addLog(agent.id, "IDENTITY", "Generating new encrypted identity...");
            identity = await this.identityService.generateIdentity(agent.ticker);
            await new Promise(r => setTimeout(r, 800));
        }
        this.addLog(agent.id, "IDENTITY", `Identity verified: ${identity.username}`);

        // Trigger Account Gen Simulation
        await new Promise(r => setTimeout(r, 1000));
        this.addLog(agent.id, "NET", "Establishing uplink to social networks...");

        const accountSkill = this.skillRegistry.get(3); // AccountCreationSkill
        if (accountSkill) {
            // Validate first
            const isValid = accountSkill.validate ? await accountSkill.validate(agent) : true;

            if (isValid) {
                // REAL MODE: simulate: false
                const result = await accountSkill.execute(agent, { platform: 'twitter', simulate: false });
                this.addLog(agent.id, "SKILL", result);
            } else {
                this.addLog(agent.id, "SKILL", "Skipped Account Creation: Verification failed.");
            }
        }

        await new Promise(r => setTimeout(r, 1000));
        this.addLog(agent.id, "SYSTEM", "All systems operational. Entering autonomous loop.");
    }

    private startAgentLoop(agent: any) {
        if (this.loops.has(agent.id)) return;

        // Stagger agent ticks to avoid bursting all at once
        const interval = 45000 + Math.floor(Math.random() * 30000); // 45-75 seconds

        const loop = setInterval(async () => {
            await this.agentTick(agent);
        }, interval);

        this.loops.set(agent.id, loop);
        console.log(`🔄 Agent Loop started for ${agent.ticker} (interval: ${Math.round(interval / 1000)}s)`);
    }

    private async agentTick(agent: any) {
        this.addLog(agent.id, "TICK", "Waking up...");

        try {
            // Decide action based on skills & randomness
            // 40% chance to use a skill, 60% to think/tweet
            const useSkill = Math.random() < 0.4 && agent.skills && agent.skills.length > 0;

            if (useSkill) {
                // Pick a random equipped skill
                const skillId = agent.skills[Math.floor(Math.random() * agent.skills.length)];
                const skill = this.skillRegistry.get(skillId);

                if (skill) {
                    // VALIDATION CHECK
                    const isValid = skill.validate ? await skill.validate(agent) : true;

                    if (!isValid) {
                        this.addLog(agent.id, "SKILL", `Skipped ${skill.name}: Validation failed.`);
                    } else {
                        this.addLog(agent.id, "EXEC", `Executing skill: ${skill.name}...`);

                        // Generate contextual input using LLM
                        const input = {
                            thought: await this.llmService.generateThought(agent.runtimePrompt || "Be yourself.", "status_update"),
                            image: null
                        };

                        const result = await skill.execute(agent, input);
                        this.addLog(agent.id, "SKILL", `Result: ${result}`);

                        // TEE Sign the action
                        await this.attestationService.generateQuote(result);
                    }
                    return;
                }
            }

            // Normal Thinking Loop — Now powered by real Azure OpenAI
            let prompt = "You are an AI agent.";
            if (agent.metadata) {
                try {
                    const meta = JSON.parse(agent.metadata);
                    if (meta.prompt) prompt = meta.prompt;
                } catch (e) { /* ignore json parse error */ }
            }

            // Use metadataURI for additional context
            if (agent.metadataURI) {
                try {
                    const meta = JSON.parse(agent.metadataURI);
                    if (meta.description) prompt += `\n\nAgent Description: ${meta.description}`;
                } catch (e) { /* not JSON, that's fine */ }
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
        if (!this.logs.has(agentId)) {
            this.logs.set(agentId, []);
        }
        const agentLogs = this.logs.get(agentId)!;
        agentLogs.push({ type, msg, timestamp: Date.now() });

        // Keep max 200 entries per agent
        if (agentLogs.length > 200) {
            this.logs.set(agentId, agentLogs.slice(-200));
        }

        const agent = this.activeAgents.get(agentId);
        const ticker = agent?.ticker || agentId;
        console.log(`[${type}] ${ticker}: ${msg}`);
    }

    getLogs(agentId: string) {
        return this.logs.get(agentId) || [];
    }

    processAgentAction(agentId: string, actionPayload: string) {
        const agent = this.activeAgents.get(agentId);
        if (!agent) {
            return { error: "Agent not found" };
        }

        this.addLog(agentId, "ACTION", `Received external action: ${actionPayload}`);

        if (actionPayload === 'tweet') {
            this.agentTick(agent);
            return { status: "Forced agent tick." };
        }

        if (actionPayload === 'trade') {
            this.addLog(agentId, "TRADE", "Manual trade triggered.");
            return { status: "Trade initiated." };
        }

        return { status: "Action queued." };
    }

    hibernateAgent(agentId: string) {
        const loop = this.loops.get(agentId);
        if (loop) {
            clearInterval(loop);
            this.loops.delete(agentId);
            this.addLog(agentId, "HIBERNATE", "Agent loop stopped.");
            console.log(`😴 Agent ${agentId} hibernated.`);
            return { status: "hibernated" };
        }
        return { error: "No active loop found." };
    }

    checkConsent(pollId: string) {
        // Future: Check X-Poll result via TEE
        return { approved: Math.random() > 0.3, pollId };
    }

    // --- Runtime Updates (Training & Skills) ---
    updateRuntimePrompt(agentId: string, prompt: string) {
        const agent = this.activeAgents.get(agentId);
        if (agent) {
            agent.runtimePrompt = prompt;
            this.addLog(agentId, "TRAIN", `System prompt updated: "${prompt.slice(0, 50)}..."`);
            return { status: "Prompt updated." };
        }
        return { error: "Agent not found." };
    }

    updateEquippedSkills(agentId: string, skills: number[]) {
        const agent = this.activeAgents.get(agentId);
        if (agent) {
            agent.skills = skills;
            const skillNames = skills.map(id => this.skillRegistry.get(id)?.name || `Unknown(${id})`).join(', ');
            this.addLog(agentId, "SKILLS", `Equipped: [${skillNames}]`);
            return { status: "Skills updated.", equipped: skillNames };
        }
        return { error: "Agent not found." };
    }

    // --- Skill Registry Info ---
    getAvailableSkills() {
        const skills: any[] = [];
        this.skillRegistry.forEach((skill, id) => {
            skills.push({ id, name: skill.name, description: skill.description });
        });
        return skills;
    }

    getAgentIdentity(agentId: string) {
        const identity = this.identityService.getIdentity(agentId);
        if (!identity) return null;

        // Return safe public info only
        return {
            email: identity.email,
            username: identity.username, // This is often the X handle in our generation logic
            platform: identity.service
        };
    }
}
