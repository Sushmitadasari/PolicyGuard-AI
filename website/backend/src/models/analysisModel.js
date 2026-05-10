const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      default: '',
      trim: true,
    },
    source: {
      type: String,
      enum: ['chat', 'analyze', 'pdf', 'website'],
      default: 'analyze',
      index: true,
    },
    policyText: {
      type: String,
      default: '',
      trim: true,
    },
    summary: {
      type: String,
      default: '',
      trim: true,
    },
    confidence: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    risks: {
      type: [String],
      default: [],
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    riskLevel: {
      type: String,
      default: '',
      trim: true,
    },
    simplified: {
      type: [String],
      default: [],
    },
    clauses: {
      type: [
        {
          clause: { type: String, default: '', trim: true },
          type: { type: String, default: '', trim: true },
          severity: { type: String, default: '', trim: true },
          explanation: { type: String, default: '', trim: true },
        },
      ],
      default: [],
    },
    documentName: {
      type: String,
      default: '',
      trim: true,
    },
    fileName: {
      type: String,
      default: '',
      trim: true,
    },
    analysisType: {
      type: String,
      default: 'PDF',
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

analysisSchema.index({ createdAt: -1 });
analysisSchema.index({ riskScore: -1 });
analysisSchema.index({ policyText: 'text', summary: 'text', risks: 'text' });

module.exports = mongoose.model('AnalysisRecord', analysisSchema);
