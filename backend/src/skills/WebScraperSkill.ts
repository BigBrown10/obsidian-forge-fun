import { ISkill } from './ISkill';

export class WebScraperSkill implements ISkill {
    public id = 17;
    public name = 'Web Scraper';
    public description = 'Fetches and parses web pages for data — prices, news, APIs.';

    public async execute(agent: any, input?: any): Promise<string> {
        const url = input?.url || 'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin,bitcoin,ethereum&vs_currencies=usd';

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 5000);

            const res = await fetch(url, {
                signal: controller.signal,
                headers: { 'User-Agent': `ForgeAgent/${agent.ticker}` }
            });
            clearTimeout(timeout);

            if (!res.ok) {
                return `🌐 [SCRAPE] Failed to fetch ${url}: ${res.status}`;
            }

            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('json')) {
                const data = await res.json();
                const summary = JSON.stringify(data).slice(0, 200);
                return `🌐 [SCRAPE] ${url.slice(0, 50)}... | JSON Response: ${summary}`;
            }

            const text = await res.text();
            return `🌐 [SCRAPE] ${url.slice(0, 50)}... | Text (${text.length} chars): ${text.slice(0, 200)}...`;
        } catch (err: any) {
            return `🌐 [SCRAPE] Error fetching ${url.slice(0, 40)}...: ${err.message || err}`;
        }
    }
}
