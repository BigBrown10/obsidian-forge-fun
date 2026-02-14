
// Simulate the environment
process.env.TWITTER_USERNAME = "mock_user";
process.env.TWITTER_PASSWORD = "mock_password";

import { TwitterService } from './src/services/TwitterService';
import { BrowserService } from './src/services/BrowserService';
import { IdentityService } from './src/services/IdentityService';

async function test() {
    console.log("🚀 Starting Twitter Browser Login Test...");

    const browserService = new BrowserService();
    const identityService = new IdentityService();
    const twitterService = new TwitterService();

    twitterService.setBrowserService(browserService);
    twitterService.setIdentityService(identityService);

    console.log("--- 1. First Run (No Cookies) ---");
    try {
        // This will mock login and fail or throw, but that's expected
        await twitterService.postTweet("GENESIS", "No Cookie Tweet");
    } catch (e) { }

    console.log("--- 2. Injecting Mock Cookies ---");
    identityService.saveCookies("GENESIS", [{ name: 'auth_token', value: 'mock_token', domain: '.twitter.com' }]);

    console.log("--- 3. Second Run (With Cookies) ---");
    try {
        await twitterService.postTweet("GENESIS", "Cookie Tweet");
    } catch (e) { }

    await browserService.close();
}

test();
