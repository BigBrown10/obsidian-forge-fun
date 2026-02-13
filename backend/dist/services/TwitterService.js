"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterService = void 0;
// Mock Twitter Service (In-Memory)
class TwitterService {
    tweets = [];
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
    async postTweet(agentId, content, image) {
        const tweet = {
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
    async getTweets(agentId) {
        return this.tweets.filter(t => t.agentId === agentId);
    }
    async getAllTweets() {
        return this.tweets;
    }
}
exports.TwitterService = TwitterService;
