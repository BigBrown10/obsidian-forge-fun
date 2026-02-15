import { ISkill } from './ISkill';
import { LLMService } from '../services/LLMService';

export class SelfImproverSkill implements ISkill {
    public id = 27;
    public name = 'Self Improver';
    public description = 'Analyzes own performance, identifies weaknesses, and adjusts strategy via LLM.';

    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }

    public async execute(agent: any, input?: any): Promise<string> {
        const logs = input?.logs || [
            `[TICK] ${agent.ticker}: Generated thought`,
            `[TWITTER] ${agent.ticker}: Posted tweet — 5 impressions`,
            `[TRADE] ${agent.ticker}: Bought 0.1 BNB of CAKE`,
            `[SENTIMENT] ${agent.ticker}: Bearish signal detected`,
        ];

        const analysis = await this.llmService.analyzePerformance(logs);

        return `🧬 [SELF-IMPROVE] Agent ${agent.ticker} Performance Analysis:\n${analysis}`;
    }
}
