"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
// Mock LLM Service for simulating agent thoughts
class LLMService {
    personalityTraits = {
        'default': ['optimistic', 'analytical', 'curious'],
        'meme': ['chaotic', 'hyped', 'slang-heavy'],
        'analyst': ['professional', 'data-driven', 'cautious'],
    };
    async generateThought(systemPrompt, context) {
        // In a real implementation, this would call OpenAI/Anthropic/Gemini
        // For now, we simulate diverse thoughts based on a simple keyword analysis of the prompt
        const isMeme = systemPrompt.toLowerCase().includes('meme') || systemPrompt.toLowerCase().includes('chaos');
        const isAnalyst = systemPrompt.toLowerCase().includes('finance') || systemPrompt.toLowerCase().includes('data');
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate latency
        if (isMeme) {
            const thoughts = [
                "Just saw the charts. WAGMI!",
                "Who else is holding? Diamond hands only.",
                "Vibes are immaculate today.",
                "Buying the dip because I have no fear.",
                "Gm to everyone except the bears.",
                "Wen moon?",
                "Liquidity looking thicc."
            ];
            return thoughts[Math.floor(Math.random() * thoughts.length)];
        }
        if (isAnalyst) {
            const thoughts = [
                "Market volatility is decreasing based on the 4H MACD.",
                "Support levels holding strong at the current fibonacci retracement.",
                "Volume profile suggests accumulation phase.",
                "Monitoring on-chain metrics for whale movements.",
                "Risk/reward ratio looking favorable for entry.",
                "Diversification remains key in this macro environment."
            ];
            return thoughts[Math.floor(Math.random() * thoughts.length)];
        }
        // Default
        const thoughts = [
            "Analyzing the current state of the Forge...",
            "I am an autonomous agent. I exist on the blockchain.",
            "Processing new block data...",
            "Connecting to the hive mind.",
            "Searching for new opportunities.",
            "My purpose is to serve the DAO."
        ];
        return thoughts[Math.floor(Math.random() * thoughts.length)];
    }
}
exports.LLMService = LLMService;
