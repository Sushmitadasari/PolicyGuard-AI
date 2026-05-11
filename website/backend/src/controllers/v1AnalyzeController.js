const {
  analyze,
  createOrchestratorErrorResponse,
  createOrchestratorSuccessResponse,
} = require('../services/analysisOrchestrator');
const { enqueueAnalysisJob, getAnalysisJob, isQueueEnabled } = require('../services/queueService');

const analyzeV1 = async (req, res, next) => {
  try {
    const wantsAsync = Boolean(req.body?.options?.async === true || req.query?.async === 'true');

    if (wantsAsync && isQueueEnabled()) {
      const job = await enqueueAnalysisJob({
        payload: req.body || {},
        options: {
          authorization: req.headers.authorization || '',
          metadata: {
            userAgent: req.headers['user-agent'] || '',
            clientIp: req.ip || req.socket?.remoteAddress || '',
            requestId: req.id,
          },
        },
      });

      if (!job) {
        return res.status(503).json({
          success: false,
          error: 'Queue is currently unavailable',
          statusCode: 503,
        });
      }

      return res.status(202).json({
        success: true,
        data: {
          jobId: String(job.id),
          status: 'queued',
        },
        meta: {
          requestId: req.id,
          mode: 'async',
        },
      });
    }

    const result = await analyze(req.body || {}, {
      authorization: req.headers.authorization || '',
      metadata: {
        userAgent: req.headers['user-agent'] || '',
        clientIp: req.ip || req.socket?.remoteAddress || '',
      },
    });

    const response = createOrchestratorSuccessResponse(result);
    return res.status(response.statusCode).json(response.body);
  } catch (error) {
    const response = createOrchestratorErrorResponse(error);
    return res.status(response.statusCode).json(response.body);
  }
};

const getAnalyzeJobStatus = async (req, res) => {
  const job = await getAnalysisJob(req.params.jobId);

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found',
      statusCode: 404,
    });
  }

  const state = await job.getState();
  const progress = job.progress || 0;

  if (state === 'completed') {
    return res.status(200).json({
      success: true,
      data: {
        jobId: String(job.id),
        status: state,
        progress,
        result: job.returnvalue,
      },
    });
  }

  if (state === 'failed') {
    return res.status(200).json({
      success: false,
      data: {
        jobId: String(job.id),
        status: state,
        progress,
        failedReason: job.failedReason,
      },
    });
  }

  return res.status(200).json({
    success: true,
    data: {
      jobId: String(job.id),
      status: state,
      progress,
    },
  });
};

module.exports = {
  analyzeV1,
  getAnalyzeJobStatus,
};