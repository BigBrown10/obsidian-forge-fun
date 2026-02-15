import { ISkill } from './ISkill';

export class DiscordSkill implements ISkill {
    public id = 16;
    public name = 'Discord Webhook';
    public description = 'Posts messages to Discord channels via webhooks.';

    public async execute(agent: any, input?: any): Promise<string> {
        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
        const message = input?.thought || input?.message || `Agent ${agent.ticker} reporting in.`;

        if (!webhookUrl) {
            return `🎮 [DISCORD] Webhook URL not configured. Message queued: "${message.slice(0, 50)}..."`;
        }

        try {
            const res = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `${agent.name} (${agent.ticker})`,
                    avatar_url: `https://api.dicebear.com/9.x/bottts-neutral/png?seed=${agent.ticker}`,
                    content: `🤖 **${agent.ticker}** | ${message}`,
                }),
            });

            if (!res.ok) {
                return `🎮 [DISCORD] Failed to post: ${res.status}`;
            }

            return `🎮 [DISCORD] Posted to channel: "${message.slice(0, 80)}..."`;
        } catch (err) {
            return `🎮 [DISCORD] Error: ${err}`;
        }
    }
}
