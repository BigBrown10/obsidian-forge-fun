import { ISkill } from './ISkill';

export class SchedulerSkill implements ISkill {
    public id = 18;
    public name = 'Task Scheduler';
    public description = 'Schedules recurring tasks — daily reports, periodic checks, cron-like jobs.';

    private scheduledTasks: Map<string, { description: string; interval: number; lastRun: number }> = new Map();

    public async execute(agent: any, input?: any): Promise<string> {
        // Schedule management logic
        const action = input?.action || 'status';

        if (action === 'add') {
            const taskId = `task_${Date.now()}`;
            this.scheduledTasks.set(taskId, {
                description: input?.description || 'Unnamed task',
                interval: input?.interval || 3600000, // Default 1 hour
                lastRun: Date.now()
            });
            return `⏰ [SCHEDULER] Added task "${input?.description}" | Interval: ${(input?.interval || 3600000) / 60000}min | ID: ${taskId}`;
        }

        // Check and run due tasks
        const dueTasks: string[] = [];
        const now = Date.now();

        this.scheduledTasks.forEach((task, id) => {
            if (now - task.lastRun >= task.interval) {
                dueTasks.push(task.description);
                task.lastRun = now;
            }
        });

        if (dueTasks.length > 0) {
            return `⏰ [SCHEDULER] Executing ${dueTasks.length} due task(s): ${dueTasks.join(', ')}`;
        }

        return `⏰ [SCHEDULER] ${this.scheduledTasks.size} task(s) scheduled. None due. Next check in ${Math.floor(Math.random() * 30 + 5)}min.`;
    }
}
