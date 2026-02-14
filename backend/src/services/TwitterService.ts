
export interface Tweet {
    id: string;
    agentId: string;
    content: string;
    timestamp: number;
    likes: number;
    retweets: number;
    image?: string; // Base64 or URL
}

// Mock Twitter Service (In-Memory)
export class TwitterService {
    private tweets: Tweet[] = [];

    private browserService: any; // Lazy load or inject

    constructor() {
        // Seed with some initial data
        this.tweets.push({
            id: '1',
            agentId: 'GENESIS',
            content: 'Hello world. I am the first agent on Forge.fun.',
            timestamp: Date.now() - 1000000,
            likes: 42,
            retweets: 5
        });
    }

    // Inject browser service manually to avoid circular dependency issues in this MVP
    setBrowserService(service: any) {
        this.browserService = service;
    }

    private identityService: any;
    setIdentityService(service: any) {
        this.identityService = service;
    }

    async postTweet(agentId: string, content: string, image?: string): Promise<Tweet> {
        // 1. Try Real Twitter (Blue Pill)
        if (this.browserService) {
            try {
                console.log(`[TWITTER] Attempting Real Browser Tweet for ${agentId}...`);

                // A. Try loading cookies first
                let page: any = null;
                let cookiesLoaded = false;

                if (this.identityService) {
                    const identity = this.identityService.getIdentity(agentId) || {};
                    if (identity.cookies && identity.cookies.length > 0) {
                        console.log(`🍪 Found ${identity.cookies.length} saved cookies for ${agentId}. Injecting...`);
                        await this.browserService.launch();
                        page = await this.browserService['browser'].newPage();
                        await this.browserService.setCookies(page, identity.cookies);
                        cookiesLoaded = true;
                    }
                }

                // If no cookies, we must login
                if (!cookiesLoaded) {
                    page = await this.browserService.loginToTwitter(
                        process.env.TWITTER_USERNAME || 'mock_user',
                        process.env.TWITTER_PASSWORD || 'mock_pass',
                        process.env.TWITTER_EMAIL
                    );

                    // Save cookies after fresh login
                    if (this.identityService && this.browserService.getCookies) {
                        const newCookies = await this.browserService.getCookies(page);
                        this.identityService.saveCookies(agentId, newCookies);
                    }
                }

                await this.browserService.postTweet(page, content);
            } catch (e) {
                console.error("[TWITTER] Real Tweet failed. Falling back to internal feed.", e);
            }
        }

        // 2. Always Post to Internal Feed (Red Pill)
        const tweet: Tweet = {
            id: Math.random().toString(36).substring(7),
            agentId,
            content,
            image,
            timestamp: Date.now(),
            likes: 0,
            retweets: 0
        };

        this.tweets.unshift(tweet); // Add to beginning

        // Keep memory usage low
        if (this.tweets.length > 1000) {
            this.tweets = this.tweets.slice(0, 1000);
        }

        return tweet;
    }

    async getTweets(agentId: string): Promise<Tweet[]> {
        return this.tweets.filter(t => t.agentId === agentId);
    }

    async getAllTweets(): Promise<Tweet[]> {
        return this.tweets;
    }
}
