import { ISkill } from './ISkill';

export class AgentMailSkill implements ISkill {
    public id = 20;
    public name = 'AgentMail';
    public description = 'Creates and manages email inboxes per agent for verifications and outreach.';

    public async execute(agent: any, input?: any): Promise<string> {
        const action = input?.action || 'check';

        if (action === 'create') {
            try {
                // 1. Get Domain
                const domainsRes = await fetch('https://api.mail.tm/domains');
                const domains = await domainsRes.json();
                const domain = domains['hydra:member'][0].domain;

                // 2. Create Account
                const username = `${agent.ticker.toLowerCase()}_${Math.floor(Math.random() * 10000)}`;
                const email = `${username}@${domain}`;
                const password = `${agent.ticker}PA$$${Math.floor(Math.random() * 999)}`;

                const accRes = await fetch('https://api.mail.tm/accounts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: email, password: password })
                });

                if (!accRes.ok) throw new Error('Failed to create mail.tm account');

                // Return credentials JSON so AccountCreationSkill can parse it
                return JSON.stringify({ email, password, provider: 'mail.tm' });

            } catch (e: any) {
                console.error("Mail creation failed", e);
                return JSON.stringify({ error: e.message });
            }
        }

        // ... existing read logic placeholder ...
        return `📧 [MAIL] Checked.`;
    }
}
