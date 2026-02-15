import { ISkill } from './ISkill';

export class ShellCommanderSkill implements ISkill {
    public id = 24;
    public name = 'Shell Commander';
    public description = 'Executes system commands on the VM for server management.';

    private allowedCommands = ['uptime', 'df -h', 'free -m', 'pm2 list', 'date', 'whoami'];

    public async execute(agent: any, input?: any): Promise<string> {
        const cmd = input?.command || this.allowedCommands[Math.floor(Math.random() * this.allowedCommands.length)];

        // Security: Only allow whitelisted commands
        if (!this.allowedCommands.some(allowed => cmd.startsWith(allowed.split(' ')[0]))) {
            return `🖥️ [SHELL] Command "${cmd}" not in whitelist. Blocked for security.`;
        }

        try {
            const { exec } = require('child_process');
            const result = await new Promise<string>((resolve, reject) => {
                exec(cmd, { timeout: 5000 }, (err: any, stdout: string, stderr: string) => {
                    if (err) reject(err);
                    else resolve(stdout.trim().slice(0, 500));
                });
            });

            return `🖥️ [SHELL] $ ${cmd}\n${result}`;
        } catch (err: any) {
            return `🖥️ [SHELL] Error executing "${cmd}": ${err.message || err}`;
        }
    }
}
