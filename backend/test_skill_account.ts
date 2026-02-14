
import { IdentityService } from './src/services/IdentityService';
import { BrowserService } from './src/services/BrowserService';
import { AccountCreationSkill } from './src/skills/AccountCreationSkill';

async function test() {
    console.log("🚀 Testing Account Creation Skill...");
    const identityService = new IdentityService();
    const browserService = new BrowserService();
    // Stub browser launch to avoid full chrome validation in quick test
    // browserService.launch = async () => { console.log("STUB: Browser Launched"); }
    // browserService['browser'] = { newPage: async () => ({ goto: async()=>{}, type: async()=>{}, close: async()=>{} }) } as any;

    const skill = new AccountCreationSkill(identityService, browserService);

    // Mock Agent
    const agent = { ticker: 'TEST_AGENT' };

    // Test Instagram
    console.log("\n--- Testing Instagram ---");
    const resInsta = await skill.execute(agent, { platform: 'instagram' });
    console.log(resInsta);

    // Test TikTok
    console.log("\n--- Testing TikTok ---");
    const resTikTok = await skill.execute(agent, { platform: 'tiktok' });
    console.log(resTikTok);
}

test();
