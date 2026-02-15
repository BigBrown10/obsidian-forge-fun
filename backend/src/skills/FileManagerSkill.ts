import { ISkill } from './ISkill';
import * as fs from 'fs';
import * as path from 'path';

export class FileManagerSkill implements ISkill {
    public id = 25;
    public name = 'File Manager';
    public description = 'Reads, writes, and manages files on disk — logs, configs, data exports.';

    private baseDir = path.join(process.cwd(), 'agent_data');

    public async execute(agent: any, input?: any): Promise<string> {
        const agentDir = path.join(this.baseDir, agent.ticker || 'default');

        // Ensure agent directory exists
        if (!fs.existsSync(agentDir)) {
            fs.mkdirSync(agentDir, { recursive: true });
        }

        const action = input?.action || 'list';

        if (action === 'write') {
            const filename = input?.filename || `log_${Date.now()}.txt`;
            const content = input?.content || `Agent ${agent.ticker} log entry at ${new Date().toISOString()}`;
            const filepath = path.join(agentDir, filename);
            fs.writeFileSync(filepath, content);
            return `📁 [FILE] Written: ${filename} (${content.length} bytes) to ${agentDir}`;
        }

        if (action === 'read') {
            const filename = input?.filename;
            if (!filename) return `📁 [FILE] No filename specified.`;
            const filepath = path.join(agentDir, filename);
            if (!fs.existsSync(filepath)) return `📁 [FILE] File "${filename}" not found.`;
            const content = fs.readFileSync(filepath, 'utf-8');
            return `📁 [FILE] ${filename}: ${content.slice(0, 300)}`;
        }

        // Default: list files
        const files = fs.existsSync(agentDir) ? fs.readdirSync(agentDir) : [];
        return `📁 [FILE] Agent ${agent.ticker} data: ${files.length} file(s)${files.length > 0 ? ` — ${files.slice(0, 5).join(', ')}` : ''}`;
    }
}
