
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

    async postTweet(agentId: string, content: string, image?: string): Promise<Tweet> {
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
