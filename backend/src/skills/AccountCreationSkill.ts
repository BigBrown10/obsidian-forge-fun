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
            await this.createTwitterAccount(identity);
            return `Attempted Twitter (X) Signup for ${identity.username}. Check screenshot 'twitter_signup.png' for verification.`;
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
        const page = await this.browserService.newPage();

        try {
            console.log("📸 Navigating to Instagram Signup...");
            await page.goto('https://www.instagram.com/accounts/emailsignup/', { waitUntil: 'networkidle' });

            // Accept Cookies Modal (if exists)
            try {
                const cookieBtn = await page.getByRole('button', { name: 'Allow all cookies' });
                if (await cookieBtn.isVisible()) await cookieBtn.click();
            } catch (e) { }

            // Fill Form
            console.log("📝 Filling Instagram Form...");
            await page.fill('input[name="emailOrPhone"]', identity.email);
            await page.fill('input[name="fullName"]', identity.username);
            await page.fill('input[name="username"]', identity.username);
            await page.fill('input[name="password"]', identity.password);

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
        const page = await this.browserService.newPage();

        try {
            console.log("🎵 Navigating to TikTok Signup...");
            await page.goto('https://www.tiktok.com/signup/phone-or-email/email', { waitUntil: 'networkidle' });

            // Fill Form
            console.log("📝 Filling TikTok Form...");
            await page.fill('input[name="email"]', identity.email);
            await page.fill('input[type="password"]', identity.password);

            console.log("✅ TikTok Form Filled.");
            await page.screenshot({ path: 'tiktok_signup_form.png' });

        } catch (e) {
            console.error("❌ TikTok Signup Failed:", e);
        } finally {
            await page.close();
        }
    }

    private async createTwitterAccount(identity: any) {
        // 1. Create Real Email via AgentMailSkill
        console.log("📧 Generating Real Email for Verification...");
        const { AgentMailSkill } = require('./AgentMailSkill');
        const mailSkill = new AgentMailSkill();
        const mailResult = await mailSkill.execute({ ticker: identity.username.substring(0, 5) }, { action: 'create' });

        let emailToUse = identity.email;
        let mailCreds: any = null;

        try {
            mailCreds = JSON.parse(mailResult);
            if (mailCreds.email) {
                console.log(`✅ Generated Email: ${mailCreds.email}`);
                emailToUse = mailCreds.email;
            }
        } catch (e) {
            console.warn("Could not generate real email, falling back to identity email.", e);
        }

        // Playwright logic: "AgentName_Data" e.g. "Greg_18226"
        const baseName = identity.username.toLowerCase().replace(/\s+/g, '');
        const targetHandle = `${baseName}_${Math.floor(10000 + Math.random() * 90000)}`;

        console.log(`🐦 Navigating to X (Twitter) Signup... Target: @${targetHandle}`);

        const page = await this.browserService.newPage();

        try {
            await page.goto('https://twitter.com/i/flow/signup', { waitUntil: 'networkidle' });

            // Step 1: Create your account
            console.log("📝 Filling Account Info...");

            // Name
            try {
                const nameInput = page.getByLabel('Name');
                await nameInput.waitFor({ state: 'visible', timeout: 10000 });
                await nameInput.fill(identity.username);
            } catch (e) {
                await page.locator('input[autocomplete="name"]').fill(identity.username);
            }

            // Email
            try {
                const useEmail = page.getByText('Use email instead');
                if (await useEmail.isVisible()) await useEmail.click();
            } catch (e) { }

            await page.getByLabel('Email').fill(emailToUse);

            // DOB
            console.log("🎂 Setting Birthday...");
            await page.getByLabel('Month').selectOption({ index: Math.floor(Math.random() * 11) + 1 });
            await page.getByLabel('Day').selectOption({ index: Math.floor(Math.random() * 27) + 1 });
            await page.getByLabel('Year').selectOption({ value: (1995 + Math.floor(Math.random() * 10)).toString() });

            // Next steps
            await page.getByRole('button', { name: 'Next' }).first().click();
            await page.waitForTimeout(1000);
            await page.getByRole('button', { name: 'Next' }).first().click();
            await page.waitForTimeout(1000);

            // Sign Up
            await page.getByRole('button', { name: 'Sign up' }).click();
            await page.waitForTimeout(5000);

            // ------------------------------------------------------------------
            // VERIFICATION CHOKEPOINT
            // ------------------------------------------------------------------

            // 1. Email Verification
            const emailInput = page.getByLabel('Verification code');
            if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
                console.log("📧 Email Verification Requested. Checking Mail.tm...");
                console.log("TODO: Implement AgentMailSkill polling for code.");
                // If we implemented Mail.tm check here:
                /*
                if (mailCreds) {
                    // poll mail
                }
                */
            }

            // 2. Phone Verification
            const isPhoneReq = await page.getByText(/phone/i).count() > 0 || await page.getByLabel('Phone number').isVisible().catch(() => false);

            if (isPhoneReq) {
                console.log("📱 Phone Verification Requested. Fetching 5sim number...");
                const { FiveSimService } = require('../services/FiveSimService');
                const fiveSim = new FiveSimService();
                const numberData = await fiveSim.buyNumber('twitter', 'usa');

                if (numberData) {
                    try {
                        await page.fill('input[name="phone_number"]', numberData.phone);
                        await page.getByRole('button', { name: 'Next' }).click();

                        const code = await fiveSim.waitForCode(numberData.id);
                        if (code) {
                            await page.fill('input[name="verif_code"]', code);
                            await page.getByRole('button', { name: 'Next' }).click();
                            console.log("✅ Phone Verified!");
                        }
                    } catch (err) {
                        console.error("Phone verification flow error", err);
                    }
                } else {
                    console.warn("⚠️ Could not acquire 5sim number. Skipping phone verification.");
                }
            }

            // Screenshot proof of success
            const screenshotPath = `twitter_signup_${targetHandle}.png`;
            await page.screenshot({ path: screenshotPath });
            console.log(`✅ Attempt Complete. Screenshot: ${screenshotPath}`);

        } catch (e) {
            console.error("❌ Twitter Signup Flow Failed:", e);
            await page.screenshot({ path: 'twitter_error.png' });
        } finally {
            await page.close();
        }
    }
}
