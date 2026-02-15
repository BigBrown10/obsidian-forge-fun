import { ISkill } from './ISkill';

export class KnowledgeBaseSkill implements ISkill {
    public id = 22;
    public name = 'Knowledge Base';
    public description = 'Queries agent memory and knowledge files for contextual information.';

    private memory: Map<string, string[]> = new Map();

    public async execute(agent: any, input?: any): Promise<string> {
        const agentId = agent.id || agent.ticker;

        if (input?.action === 'store') {
            const existing = this.memory.get(agentId) || [];
            existing.push(input.data);
            this.memory.set(agentId, existing);
            return `🧠 [KB] Stored new knowledge entry. Total entries: ${existing.length}`;
        }

        if (input?.action === 'search') {
            const entries = this.memory.get(agentId) || [];
            const query = input?.query || '';
            const matches = entries.filter(e => e.toLowerCase().includes(query.toLowerCase()));
            return `🧠 [KB] Search "${query}": Found ${matches.length} match(es) from ${entries.length} total entries.`;
        }

        // Default: status
        const entryCount = this.memory.get(agentId)?.length || 0;
        return `🧠 [KB] Agent ${agent.ticker} knowledge base: ${entryCount} entries stored. Ready for queries.`;
    }
}
