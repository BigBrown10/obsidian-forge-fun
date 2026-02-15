import { ISkill } from './ISkill';

export class TelegramSkill implements ISkill {
    public id = 15;
    public name = 'Telegram Bot';
    public description = 'Posts messages to Telegram channels and groups via Bot API.';

    public async execute(agent: any, input?: any): Promise<string> {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const message = input?.thought || input?.message || `[${agent.ticker}] Agent update: Systems operational.`;

        if (!botToken || !chatId) {
            return `📱 [TELEGRAM] Bot token or chat ID not configured. Message queued: "${message.slice(0, 50)}..."`;
        }

        try {
            const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: `🤖 *${agent.name}* (${agent.ticker})\n\n${message}`,
                    parse_mode: 'Markdown',
                }),
            });

            if (!res.ok) {
                return `📱 [TELEGRAM] Failed to send: ${res.status}`;
            }

            return `📱 [TELEGRAM] Message sent to channel: "${message.slice(0, 80)}..."`;
        } catch (err) {
            return `📱 [TELEGRAM] Error: ${err}`;
        }
    }
}
