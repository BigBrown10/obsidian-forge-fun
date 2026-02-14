
// Simulate the environment
process.env.TWITTER_USERNAME = "mock_user";
process.env.TWITTER_PASSWORD = "mock_password";

import { TwitterService } from './src/services/TwitterService';
import { BrowserService } from './src/services/BrowserService';

// Mock BrowserService to avoid actual full launch in this unit test if possible,
// but here we want to see if it tries.
// Actually, let's run the real thing but expect failure due to bad credentials.

async function test() {
    const browserService = new BrowserService();
    const twitterService = new TwitterService();
    twitterService.setBrowserService(browserService);

    console.log("🚀 Starting Twitter Browser Login Test...");
    try {
        await twitterService.postTweet("GENESIS", "This is a test tweet from the browser.");
    } catch (e) {
        console.error("Test finished with error (expected):", e);
    }

    // Close browser if it opened
    await browserService.close();
}

test();
