const { Queue, Worker, QueueEvents } = require('bullmq');
const config = require('../config/centralConfig');
const { logger } = require('../config/logger');

let analysisQueue;
let analysisQueueEvents;
let analysisWorker;

const redisConnection = {
  url: config.get('REDIS_URL'),
};

const isQueueEnabled = () => config.get('QUEUE_ENABLED', false) && config.get('REDIS_ENABLED', false);

const getQueueName = (name) => `${config.get('QUEUE_PREFIX', 'policyguard-jobs')}:${name}`;

const ensureQueue = () => {
  if (!isQueueEnabled()) {
    return null;
  }

  if (!analysisQueue) {
    analysisQueue = new Queue(getQueueName('analysis'), { connection: redisConnection });
    analysisQueueEvents = new QueueEvents(getQueueName('analysis'), { connection: redisConnection });
    analysisQueueEvents.on('completed', ({ jobId }) => logger.info({ event: 'job-completed', jobId }));
    analysisQueueEvents.on('failed', ({ jobId, failedReason }) => logger.error({ event: 'job-failed', jobId, failedReason }));
  }

  return analysisQueue;
};

const startAnalysisWorker = (processor) => {
  if (!isQueueEnabled()) {
    logger.warn({ event: 'queue-disabled' });
    return null;
  }

  if (!analysisWorker) {
    analysisWorker = new Worker(
      getQueueName('analysis'),
      async (job) => processor(job),
      { connection: redisConnection, concurrency: 4 }
    );
    analysisWorker.on('completed', (job) => logger.info({ event: 'worker-completed', jobId: job.id }));
    analysisWorker.on('failed', (job, error) => logger.error({ event: 'worker-failed', jobId: job?.id, message: error.message }));
  }

  return analysisWorker;
};

const enqueueAnalysisJob = async (payload) => {
  const queue = ensureQueue();
  if (!queue) {
    return null;
  }

  const job = await queue.add('analyze', payload, {
    attempts: config.get('ANALYSIS_JOB_ATTEMPTS', 2),
    backoff: {
      type: 'exponential',
      delay: config.get('ANALYSIS_JOB_BACKOFF_MS', 2000),
    },
    removeOnComplete: 200,
    removeOnFail: 500,
  });

  return job;
};

const getAnalysisJob = async (jobId) => {
  const queue = ensureQueue();
  if (!queue || !jobId) {
    return null;
  }

  return queue.getJob(String(jobId));
};

module.exports = {
  isQueueEnabled,
  ensureQueue,
  startAnalysisWorker,
  enqueueAnalysisJob,
  getAnalysisJob,
};
