"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterSkill = void 0;
class TwitterSkill {
    id = 1;
    name = 'Twitter Sybil';
    description = 'Allows the agent to post thoughts to X.';
    twitterService;
    constructor(twitterService) {
        this.twitterService = twitterService;
    }
    async execute(agent, input) {
        await this.twitterService.postTweet(agent.ticker, input.thought, input.image);
        return `Posted tweet: ${input.thought}`;
    }
}
exports.TwitterSkill = TwitterSkill;
