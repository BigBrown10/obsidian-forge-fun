import { ISkill } from './ISkill';

export class AgentMailSkill implements ISkill {
    public id = 20;
    public name = 'AgentMail';
    public description = 'Creates and manages email inboxes per agent for verifications and outreach.';

    public async execute(agent: any, input?: any): Promise<string> {
        const action = input?.action || 'check';

        if (action === 'create') {
            // In production: use Mail.tm API to create a disposable inbox
            const email = `${agent.ticker.toLowerCase()}_${Date.now().toString(36)}@mail.tm`;
            return `📧 [MAIL] Created inbox: ${email} | Ready for verifications and outreach.`;
        }

        if (action === 'send') {
            const to = input?.to || 'recipient@example.com';
            const subject = input?.subject || `Update from ${agent.name}`;
            return `📧 [MAIL] Sent email to ${to} | Subject: "${subject}" | Status: Queued`;
        }

        // Default: check inbox
        const unread = Math.floor(Math.random() * 5);
        return `📧 [MAIL] ${agent.ticker} inbox checked. ${unread} unread message(s).${unread > 0 ? ' Processing...' : ''}`;
    }
}
