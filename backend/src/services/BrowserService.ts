import { chromium, Browser, BrowserContext, Page } from 'playwright';

export class BrowserService {
    private browser: Browser | null = null;
    private context: BrowserContext | null = null;

    async launch() {
        if (!this.browser) {
            console.log("🚀 Launching Playwright (Chromium)...");
            this.browser = await chromium.launch({
                headless: false, // Visible for "works good" verification
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            this.context = await this.browser.newContext({
                viewport: { width: 1280, height: 800 },
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                locale: 'en-US',
                timezoneId: 'America/New_York'
            });
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.context = null;
        }
    }

    async visitAndScreenshot(url: string): Promise<{ title: string, screenshot: string }> {
        if (!this.browser) await this.launch();

        const page = await this.context!.newPage();
        try {
            console.log(`🌐 Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

            const title = await page.title();
            console.log(`📄 Page Title: ${title}`);

            const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 80 });

            return {
                title,
                screenshot: `data:image/jpeg;base64,${screenshotBuffer.toString('base64')}`
            };

        } catch (error) {
            console.error(`❌ Error visiting ${url}:`, error);
            throw error;
        } finally {
            await page.close();
        }
    }

    async newPage(): Promise<Page> {
        if (!this.browser) await this.launch();
        return await this.context!.newPage();
    }

    async getCookies(page: Page) {
        if (!this.context) return [];
        return await this.context.cookies();
    }
}
