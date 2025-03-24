import { Queue, Worker } from 'bullmq'
import Redis from 'ioredis'

import { fetchFeeds } from './jobs/fetchFeeds'

type schedulerType = {
  name: string;
  cron: string;
  handler: () => Promise<void>;
};

// Redis connection
export const connection = new Redis('redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})
export const schedulerQueue = new Queue('scheduler', { connection })

/**
 * Scheduler Array
 * Defines scheduled tasks with name, cron, and handler.
 */
const scheduler: schedulerType[] = [
  {
    name: 'Fetch news items',
    cron: "*/5 * * * *", // every 5 minutes
    handler: fetchFeeds,
  },
]

// Clean up old scheduled jobs
const cleanOldJobs = async () => {
  const repeatableJobs = await schedulerQueue.getRepeatableJobs()
  for (const job of repeatableJobs) {
    console.log(`Removing old job: ${job.name} with key: ${job.key}`)
    await schedulerQueue.removeJobScheduler(job.key)
  }
}

// Main function to schedule jobs
const main = async () => {
  await cleanOldJobs() // Clean up previously set cron jobs

  for (const task of scheduler) {
    await schedulerQueue.add(task.name, {}, {
      repeat: { pattern: task.cron },
    })
  }

  // Worker to handle the scheduler queue
  new Worker(
    'scheduler',
    async job => {
      const task = scheduler.find(t => t.name === job.name)
      if (task && task.handler) {
        await task.handler()
      }
    },
    {
      connection,
      removeOnComplete: { count: 10 },
      removeOnFail: { count: 50 },
    }
  )

  const repeatableJobs = await schedulerQueue.getJobSchedulers()
  console.table(repeatableJobs)
}

main().catch(err => console.error('Scheduler Error:', err))
