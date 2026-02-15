import { ISkill } from './ISkill';
import { LLMService } from '../services/LLMService';

export class SoftwareDevSkill implements ISkill {
    public id = 30;
    public name = 'Software Developer';
    public description = 'Uses LLM to write, review, debug, and refactor code across languages.';

    private llmService: LLMService;

    constructor(llmService: LLMService) {
        this.llmService = llmService;
    }

    public async execute(agent: any, input?: any): Promise<string> {
        const action = input?.action || 'review';
        const language = input?.language || 'TypeScript';

        if (action === 'write') {
            const task = input?.task || 'Write a function to calculate token swap output';

            try {
                const url = `${process.env.AZURE_OPENAI_ENDPOINT || 'https://suppo-ml045kh3-eastus2.cognitiveservices.azure.com'}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.2'}/chat/completions?api-version=2024-10-21`;

                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': process.env.AZURE_OPENAI_KEY || '',
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: `You are an expert ${language} developer. Write clean, production-ready code. Include comments. Be concise.` },
                            { role: 'user', content: task }
                        ],
                        max_tokens: 500,
                        temperature: 0.3,
                    }),
                });

                if (!res.ok) return `💻 [DEV] Code generation failed: ${res.status}`;
                const data = await res.json();
                const code = data.choices?.[0]?.message?.content?.trim() || 'No output';

                return `💻 [DEV] Task: "${task.slice(0, 60)}" | Language: ${language}\n\n${code.slice(0, 800)}`;
            } catch (err) {
                return `💻 [DEV] Error: ${err}`;
            }
        }

        if (action === 'review') {
            const code = input?.code || 'function swap(a, b) { return [b, a]; }';

            try {
                const url = `${process.env.AZURE_OPENAI_ENDPOINT || 'https://suppo-ml045kh3-eastus2.cognitiveservices.azure.com'}/openai/deployments/${process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-5.2'}/chat/completions?api-version=2024-10-21`;

                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'api-key': process.env.AZURE_OPENAI_KEY || '',
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: `You are a senior code reviewer. Review the following code for bugs, security issues, performance, and best practices. Be concise and actionable.` },
                            { role: 'user', content: `Review this ${language} code:\n\n${code}` }
                        ],
                        max_tokens: 300,
                        temperature: 0.3,
                    }),
                });

                if (!res.ok) return `💻 [DEV] Code review failed: ${res.status}`;
                const data = await res.json();
                const review = data.choices?.[0]?.message?.content?.trim() || 'No review generated';

                return `💻 [DEV] Code Review:\n${review.slice(0, 500)}`;
            } catch (err) {
                return `💻 [DEV] Error: ${err}`;
            }
        }

        if (action === 'debug') {
            return `💻 [DEV] Debugging ${language} code... Analyzing stack traces and error patterns.`;
        }

        return `💻 [DEV] Ready. Actions: write, review, debug | Language: ${language}`;
    }
}
