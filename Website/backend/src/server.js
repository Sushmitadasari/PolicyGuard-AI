const dotenv = require('dotenv');

dotenv.config();

const config = require('./config/centralConfig');
const { logger } = require('./config/logger');
const { connectDatabase } = require('./config/db');
const app = require('./app');
const { startAnalysisWorker, isQueueEnabled } = require('./services/queueService');
const {
  analyze,
  createOrchestratorErrorResponse,
} = require('./services/analysisOrchestrator');

const PORT = config.get('PORT', 3000);
const profileRoutes = require("./routes/profileRoutes");
(async () => {
  try {
    config.loadConfig();
    await connectDatabase();

    if (isQueueEnabled()) {
      startAnalysisWorker(async (job) => {
        try {
          return await analyze(job.data.payload || {}, job.data.options || {});
        } catch (error) {
          const wrapped = createOrchestratorErrorResponse(error);
          throw new Error(wrapped.body?.error?.message || error.message);
        }
      });
    }

    app.listen(PORT, () => {
      logger.info({ event: 'server-started', port: PORT, env: config.get('NODE_ENV') });
    });
  } catch (error) {
    logger.error({ event: 'server-start-failed', message: error.message });
    process.exit(1);
  }
})();
