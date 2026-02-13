export interface ISkill {
    id: number;
    name: string;
    description: string;
    execute(agent: any, input?: any): Promise<string>;
}
