import { ISkill } from './ISkill';
import { IdentityService } from '../services/IdentityService';
import { BrowserService } from '../services/BrowserService';

export class AccountCreationSkill implements ISkill {
    public id = 3; // Skill ID
    public name = 'Account Gen';
    public description = 'Generates identity and attempts to create social accounts.';

    private identityService: IdentityService;
    private browserService: BrowserService;

    constructor(identityService: IdentityService, browserService: BrowserService) {
        this.identityService = identityService;
        this.browserService = browserService;
    }

    public async execute(agent: any, input: any): Promise<string> {
        // 1. Ensure Identity
        let identity = this.identityService.getIdentity(agent.ticker);
        if (!identity) {
            identity = await this.identityService.generateIdentity(agent.ticker);
        }

        const platform = input.platform || "twitter";
        const isSimulated = input.simulate || false;

        if (isSimulated) {
            console.log(`[SIM] Mocking account creation for ${platform}...`);
            await new Promise(r => setTimeout(r, 1500)); // Fake delay
            return `[SIMULATION] Successfully provisioned ${platform} account for ${identity.email}. Verification bypassed.`;
        }

        console.log(`🛠️ Attempting to create ${platform} account for ${identity.username}...`);

        if (platform === 'twitter') {
            return `Generated Identity: ${identity.email} / ${identity.password}. Ready to sign up for ${platform}.`;
        }

        if (platform === 'instagram') {
            await this.createInstagramAccount(identity);
            return `Attempted Instagram Signup for ${identity.username}. Check logs/screenshots for status.`;
        }

        if (platform === 'tiktok') {
            await this.createTikTokAccount(identity);
            return `Attempted TikTok Signup for ${identity.username}. Check logs/screenshots for status.`;
        }

        return `Platform ${platform} not supported yet.`;
    }

    private async createInstagramAccount(identity: any) {
        if (!this.browserService['browser']) await this.browserService.launch();
        const page = await this.browserService['browser']!.newPage();

        try {
            console.log("📸 Navigating to Instagram Signup...");
            await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'networkidle2' });

            // Accept Cookies Modal (if exists)
            try {
                const cookieBtn = await page.waitForSelector('button:has-text("Allow all cookies")', { timeout: 3000 });
                await cookieBtn?.click();
            } catch (e) { }

            // Fill Form
            console.log("📝 Filling Instagram Form...");
            await page.type('input[name="emailOrPhone"]', identity.email);
            await page.type('input[name="fullName"]', identity.username);
            await page.type('input[name="username"]', identity.username);
            await page.type('input[name="password"]', identity.password);

            // Click Signup
            // Note: Instagram usually requires Birthday next, then Email Code.
            // await page.click('button[type="submit"]');

            console.log("✅ Instagram Form Filled.");
            await page.screenshot({ path: 'instagram_signup_form.png' });

        } catch (e) {
            console.error("❌ Instagram Signup Failed:", e);
        } finally {
            await page.close();
        }
    }

    private async createTikTokAccount(identity: any) {
        if (!this.browserService['browser']) await this.browserService.launch();
        const page = await this.browserService['browser']!.newPage();

        try {
            console.log("🎵 Navigating to TikTok Signup...");
            await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'networkidle2' });

            // Fill Form
            console.log("📝 Filling TikTok Form...");
            await page.type('input[name="email"]', identity.email);
            await page.type('input[type="password"]', identity.password);

            // Birthday Selectors are complex (custom dropdowns), skipping for MVP

            console.log("✅ TikTok Form Filled.");
            await page.screenshot({ path: 'tiktok_signup_form.png' });

        } catch (e) {
            console.error("❌ TikTok Signup Failed:", e);
        } finally {
            await page.close();
        }
    }
}
