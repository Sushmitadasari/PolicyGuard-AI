const express = require('express');
const cors = require('cors');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const analyzeRoutes = require('./routes/analyzeRoutes');
const pdfRoutes = require('./routes/pdfRoutes');
const websiteRoutes = require('./routes/websiteRoutes');
const historyRoutes = require('./routes/historyRoutes');
const cacheRoutes = require('./routes/cacheRoutes');
const reportRoutes = require('./routes/reportRoutes');
const { isDatabaseConnected, getDatabaseConnectionError } = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(loggerMiddleware);

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'API running',
  });
});

app.get('/health/db', (req, res) => {
  const error = getDatabaseConnectionError();

  res.status(200).json({
    connected: isDatabaseConnected(),
    status: isDatabaseConnected() ? 'connected' : 'disconnected',
    error: error ? error.message : null,
  });
});

app.use('/auth', authRoutes);
app.use('/', chatRoutes);
app.use('/chatbot', chatbotRoutes);
app.use('/', analyzeRoutes);
app.use('/pdf', pdfRoutes);
app.use('/website', websiteRoutes);
app.use('/history', historyRoutes);
app.use('/cache', cacheRoutes);
app.use('/reports', reportRoutes);

app.use(errorMiddleware);

module.exports = app;
