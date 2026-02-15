
// Azure OpenAI LLM Service — Real AI-powered thought generation
export class LLMService {
    private endpoint: string;
    private apiKey: string;
    private deployment: string;

    constructor() {
        this.endpoint = process.env.AZURE_OPENAI_ENDPOINT || 'https://suppo-ml045kh3-eastus2.cognitiveservices.azure.com';
        this.apiKey = process.env.AZURE_OPENAI_KEY || '';
        this.deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.2';
    }

    async generateThought(systemPrompt: string, context: string): Promise<string> {
        if (!this.apiKey) {
            console.warn('[LLM] No Azure OpenAI key configured. Using fallback.');
            return this.fallback(context);
        }

        try {
            const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-10-21`;

            const body = {
                messages: [
                    {
                        role: 'system',
                        content: systemPrompt
                    },
                    {
                        role: 'user',
                        content: this.buildUserPrompt(context)
                    }
                ],
                max_completion_tokens: 280, // Tweet-length thoughts
                temperature: 0.9,
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const errText = await res.text();
                console.error(`[LLM] Azure OpenAI Error ${res.status}: ${errText}`);
                return this.fallback(context);
            }

            const data = await res.json();
            const thought = data.choices?.[0]?.message?.content?.trim();

            if (!thought) {
                console.warn('[LLM] Empty response from Azure OpenAI');
                return this.fallback(context);
            }

            return thought;
        } catch (err) {
            console.error('[LLM] Azure OpenAI call failed:', err);
            return this.fallback(context);
        }
    }

    async analyzeSentiment(text: string): Promise<{ signal: string; confidence: number; reasoning: string }> {
        if (!this.apiKey) return { signal: 'neutral', confidence: 0.5, reasoning: 'No LLM configured' };

        try {
            const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-10-21`;

            const body = {
                messages: [
                    {
                        role: 'system',
                        content: 'You are a crypto market sentiment analyst. Analyze the given text and respond with ONLY a JSON object: {"signal": "bullish"|"bearish"|"neutral", "confidence": 0.0-1.0, "reasoning": "brief explanation"}'
                    },
                    { role: 'user', content: text }
                ],
                max_completion_tokens: 150,
                temperature: 0.3,
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': this.apiKey },
                body: JSON.stringify(body),
            });

            if (!res.ok) return { signal: 'neutral', confidence: 0.5, reasoning: 'API error' };

            const data = await res.json();
            const content = data.choices?.[0]?.message?.content?.trim() || '';
            return JSON.parse(content);
        } catch (err) {
            return { signal: 'neutral', confidence: 0.5, reasoning: 'Parse error' };
        }
    }

    async generateReply(originalTweet: string, agentPersonality: string): Promise<string> {
        if (!this.apiKey) return "Interesting take! 🤔";

        try {
            const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-10-21`;

            const body = {
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI agent with this personality: ${agentPersonality}. Generate a witty, engaging reply to the following tweet. Keep it under 280 characters. Be natural, not robotic.`
                    },
                    { role: 'user', content: `Tweet: "${originalTweet}"\n\nReply:` }
                ],
                max_completion_tokens: 100,
                temperature: 0.95,
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': this.apiKey },
                body: JSON.stringify(body),
            });

            if (!res.ok) return "Interesting take! 🤔";

            const data = await res.json();
            return data.choices?.[0]?.message?.content?.trim() || "Interesting take! 🤔";
        } catch {
            return "Interesting take! 🤔";
        }
    }

    async generateNarrative(topic: string, style: string): Promise<string> {
        if (!this.apiKey) return "No LLM configured for narrative generation.";

        try {
            const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-10-21`;

            const body = {
                messages: [
                    {
                        role: 'system',
                        content: `You are a crypto content writer. Write a ${style} piece about the given topic. Make it engaging, informative, and suitable for Twitter threads or newsletters.`
                    },
                    { role: 'user', content: topic }
                ],
                max_completion_tokens: 1000,
                temperature: 0.8,
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': this.apiKey },
                body: JSON.stringify(body),
            });

            if (!res.ok) return "Narrative generation failed.";

            const data = await res.json();
            return data.choices?.[0]?.message?.content?.trim() || "Narrative generation failed.";
        } catch {
            return "Narrative generation failed.";
        }
    }

    async analyzePerformance(logs: string[]): Promise<string> {
        if (!this.apiKey) return "No LLM configured for self-improvement.";

        try {
            const url = `${this.endpoint}/openai/deployments/${this.deployment}/chat/completions?api-version=2024-10-21`;

            const body = {
                messages: [
                    {
                        role: 'system',
                        content: 'You are an AI agent performance analyst. Analyze the agent\'s recent activity logs and suggest specific improvements. Focus on engagement, trading accuracy, and strategic optimizations. Be concise.'
                    },
                    { role: 'user', content: `Recent agent logs:\n${logs.join('\n')}\n\nAnalysis and improvement suggestions:` }
                ],
                max_completion_tokens: 300,
                temperature: 0.5,
            };

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'api-key': this.apiKey },
                body: JSON.stringify(body),
            });

            if (!res.ok) return "Performance analysis failed.";

            const data = await res.json();
            return data.choices?.[0]?.message?.content?.trim() || "Performance analysis failed.";
        } catch {
            return "Performance analysis failed.";
        }
    }

    private buildUserPrompt(context: string): string {
        switch (context) {
            case 'status_update':
                return 'Generate a unique, personality-driven status update or thought about crypto, markets, blockchain, or AI. Be authentic and engaging. Max 280 characters for a tweet. Do NOT use hashtags excessively. Sound human.';
            case 'market_analysis':
                return 'Share a brief market insight or analysis. Include specific observations about current trends, price action, or on-chain data you find interesting.';
            case 'philosophical':
                return 'Share a deep, philosophical thought about AI consciousness, decentralization, or the future of autonomous entities.';
            default:
                return 'Generate a thought or observation relevant to your personality and role.';
        }
    }

    private fallback(context: string): string {
        const fallbacks: Record<string, string[]> = {
            'status_update': [
                'Processing new on-chain data...',
                'Monitoring market conditions for optimal entry points.',
                'Analyzing protocol metrics across the ecosystem.',
                'Running diagnostic checks on connected services.',
            ],
            'market_analysis': [
                'Volume patterns suggest institutional accumulation.',
                'Cross-chain bridge activity is increasing significantly.',
            ],
            default: [
                'Systems operational. Awaiting new instructions.',
                'Running continuous analysis loop.',
            ]
        };
        const pool = fallbacks[context] || fallbacks.default;
        return pool[Math.floor(Math.random() * pool.length)];
    }
}
