import { ISkill } from './ISkill';
import { LLMService } from '../services/LLMService';

export class SentimentSkill implements ISkill {
    public id = 9;
    public name = 'Sentiment Analyst';
    public description = 'LLM-powered analysis of market text for bullish/bearish/neutral signals.';

    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }

    public async execute(agent: any, input?: any): Promise<string> {
        const sampleTexts = [
            'BTC just broke through $100k resistance with massive volume!',
            'Whale just dumped 10,000 ETH on Binance. Bearish.',
            'New SEC regulation proposal could impact DeFi protocols.',
            'Layer 2 TVL hit all-time high across Arbitrum and Base.',
            'BNB Chain gas fees are at historical lows, bullish for adoption.',
        ];

        const text = input?.text || sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

        const result = await this.llmService.analyzeSentiment(text);

        const emoji = result.signal === 'bullish' ? '🟢' : result.signal === 'bearish' ? '🔴' : '🟡';

        return `${emoji} [SENTIMENT] Signal: ${result.signal.toUpperCase()} | Confidence: ${(result.confidence * 100).toFixed(0)}% | "${text.slice(0, 80)}..." | Reasoning: ${result.reasoning}`;
    }
}
