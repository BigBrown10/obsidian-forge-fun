import { ISkill } from './ISkill';
import { TwitterService } from '../services/TwitterService';

export class TwitterSkill implements ISkill {
    public id = 1;
    public name = 'Twitter Sybil';
    public description = 'Allows the agent to post thoughts to X.';
    private twitterService: TwitterService;

    constructor(twitterService: TwitterService) {
        this.twitterService = twitterService;
    }

    public async execute(agent: any, input: any): Promise<string> {
        await this.twitterService.postTweet(agent.ticker, input.thought, input.image);
        return `Posted tweet: ${input.thought}`;
    }
}
