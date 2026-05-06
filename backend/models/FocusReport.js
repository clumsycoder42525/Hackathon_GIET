const mongoose = require('mongoose');

const FocusReportSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  duration: { type: Number, required: true }, // duration in seconds
  distractions: { type: Number, default: 0 },
  focusScore: { type: Number, required: true },
  analysis: { type: String },
  tips: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FocusReport', FocusReportSchema);
