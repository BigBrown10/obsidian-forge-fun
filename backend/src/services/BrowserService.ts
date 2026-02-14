import puppeteer, { Browser, Page } from 'puppeteer';

export class BrowserService {
    private browser: Browser | null = null;

    async launch() {
        if (!this.browser) {
            console.log("🚀 Launching Headless Browser...");
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // Required for running as root/docker
            });
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async visitAndScreenshot(url: string): Promise<{ title: string, screenshot: string }> {
        if (!this.browser) await this.launch();

        const page = await this.browser!.newPage();
        try {
            console.log(`🌐 Navigating to ${url}...`);
            // Set a realistic viewport
            await page.setViewport({ width: 1280, height: 800 });

            await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

            const title = await page.title();
            console.log(`📄 Page Title: ${title}`);

            // Take screenshot as base64
            const screenshotBuffer = await page.screenshot({ encoding: 'base64', type: 'jpeg', quality: 80 });

            return {
                title,
                screenshot: `data:image/jpeg;base64,${screenshotBuffer}`
            };

        } catch (error) {
            console.error(`❌ Error visiting ${url}:`, error);
            throw error;
        } finally {
            await page.close();
        }
    }

    async loginToTwitter(username: string, password: string, email?: string) {
        if (!this.browser) await this.launch();
        const page = await this.browser!.newPage();

        try {
            console.log(`🐦 Logging in to Twitter as ${username}...`);
            await page.setViewport({ width: 1280, height: 800 });
            await page.goto('https://twitter.com/i/flow/login', { waitUntil: 'networkidle2' });

            // 1. Enter Username
            try {
                const userInput = await page.waitForSelector('input[autocomplete="username"]', { timeout: 10000 });
                await userInput?.type(username, { delay: 100 });
                await page.keyboard.press('Enter');
            } catch (e) {
                console.log("Could not find username input, checking if already logged in or other state...");
            }

            // 2. Check for "Unusual Activity" (Email/Phone challenge) OR Password
            try {
                const challenge = await page.waitForSelector('input[name="text"]', { timeout: 5000 });
                if (challenge && email) {
                    console.log("⚠️  Challenge detected. Entering email...");
                    await challenge.type(email, { delay: 100 });
                    await page.keyboard.press('Enter');
                }
            } catch (e) {
                // No challenge, proceed
            }

            // 3. Enter Password
            const passwordInput = await page.waitForSelector('input[name="password"]');
            await passwordInput?.type(password, { delay: 100 });
            await page.keyboard.press('Enter');

            // 4. Wait for Login Success (Home / Compose)
            await page.waitForSelector('[data-testid="SideNav_NewTweet_Button"]', { timeout: 15000 });
            console.log("✅ Login Successful!");

            return page; // Return page logged in

        } catch (error) {
            console.error("❌ Login Failed on Selector:", error);
            // Don't close page here so we can debug or fetch cookies if partially successful
            // await page.close(); 
            throw error;
        }
    }

    async postTweet(page: Page | null, text: string) {
        // If page is null, we assume we need to login or use existing context.
        if (!page) throw new Error("Browser Page not active.");

        try {
            console.log(`🐦 Posting Tweet: "${text}"`);

            // Click "Post" button
            const composeBtn = await page.waitForSelector('[data-testid="SideNav_NewTweet_Button"]');
            await composeBtn?.click();

            // Type text
            const editor = await page.waitForSelector('[data-testid="tweetTextarea_0"]');
            await editor?.type(text, { delay: 50 });

            // Click Send
            const sendBtn = await page.waitForSelector('[data-testid="tweetButton"]');
            await sendBtn?.click();

            console.log("✅ Tweet Sent!");
            await new Promise(r => setTimeout(r, 2000)); // Wait for animation
            await page.close();
            return true;

        } catch (e) {
            console.error("❌ Failed to Tweet:", e);
            throw e;
        }
    }

    async setCookies(page: Page, cookies: any[]) {
        if (!page) return;
        console.log(`🍪 Injecting ${cookies.length} cookies...`);
        await page.setCookie(...cookies);
    }

    async getCookies(page: Page) {
        if (!page) return [];
        return await page.cookies();
    }
}
