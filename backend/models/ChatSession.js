const mongoose = require('mongoose');

const ChatSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    tone: { type: String },
    tip: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  lastTone: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatSession', ChatSessionSchema);
