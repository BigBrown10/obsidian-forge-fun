import { ISkill } from './ISkill';
import { LLMService } from '../services/LLMService';

export class NarrativeWriterSkill implements ISkill {
    public id = 28;
    public name = 'Narrative Writer';
    public description = 'LLM generates long-form reports, Twitter threads, newsletters, and alpha drops.';

    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }

    public async execute(agent: any, input?: any): Promise<string> {
        const topics = [
            'Weekly DeFi recap: Top performing protocols and emerging trends',
            'Analysis: Is BNB Chain ready for the next wave of adoption?',
            'Deep dive: How AI agents are reshaping on-chain trading',
            'Thread: 5 undervalued tokens with strong fundamentals',
        ];

        const topic = input?.topic || topics[Math.floor(Math.random() * topics.length)];
        const style = input?.style || 'Twitter thread';

        const narrative = await this.llmService.generateNarrative(topic, style);

        return `📝 [NARRATIVE] Style: ${style} | Topic: "${topic.slice(0, 50)}..."\n\n${narrative.slice(0, 500)}${narrative.length > 500 ? '...' : ''}`;
    }
}
