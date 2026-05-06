const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const Groq = require('groq-sdk');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const auth = require('./middleware/auth');
const User = require('./models/User');
const Note = require('./models/Note');
const ChatSession = require('./models/ChatSession');
const FocusReport = require('./models/FocusReport');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_student_companion_123';

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-companion')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Configure Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const upload = multer({ dest: 'uploads/' });

// --- AUTH ROUTES ---

// 1. Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

// 2. Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- PROTECTED FEATURE ROUTES ---

// 3. AI Chat (Protected)
app.post('/api/chat', auth, async (req, res) => {
  try {
    const { message, history } = req.body;
    
    const systemPrompt = `
      You are an AI Student Companion. You provide empathetic, academic help.
      Return JSON: { "response": "text", "detectedTone": "stressed/confused/motivated", "empathyTip": "tip" }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...history, { role: "user", content: message }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiRes = JSON.parse(completion.choices[0].message.content);

    // Save to DB
    let session = await ChatSession.findOne({ user: req.user.id }).sort({ createdAt: -1 });
    if (!session || session.messages.length > 50) {
      session = new ChatSession({ user: req.user.id, messages: [] });
    }
    
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ 
      role: 'assistant', 
      content: aiRes.response, 
      tone: aiRes.detectedTone,
      tip: aiRes.empathyTip 
    });
    session.lastTone = aiRes.detectedTone;
    await session.save();

    res.json(aiRes);
  } catch (error) {
    res.status(500).json({ error: 'Chat failed' });
  }
});

// 4. Smart Notes (Protected)
app.post('/api/generate-notes', auth, upload.single('audio'), async (req, res) => {
  try {
    const { text, title } = req.body;
    let inputContent = text;

    if (req.file) {
      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(req.file.path),
        model: "whisper-large-v3",
      });
      inputContent = transcription.text;
      fs.unlinkSync(req.file.path);
    }

    const prompt = `Convert to structured notes: ${inputContent}. Return JSON: { "structuredNotes": "md", "summary": "text", "keyConcepts": [], "importantQuestions": [] }`;
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    const aiRes = JSON.parse(completion.choices[0].message.content);

    const note = new Note({
      user: req.user.id,
      title: title || 'Untitled Note',
      content: aiRes.structuredNotes,
      summary: aiRes.summary,
      keyConcepts: aiRes.keyConcepts,
      importantQuestions: aiRes.importantQuestions
    });
    await note.save();

    res.json(aiRes);
  } catch (error) {
    res.status(500).json({ error: 'Notes failed' });
  }
});

// 5. Wellbeing (Protected)
app.post('/api/analyze-health', auth, async (req, res) => {
  try {
    const { sleep, diet, activity } = req.body;
    const prompt = `Analyze wellbeing: Sleep ${sleep}h, Diet ${diet}, Activity ${activity}. Return JSON: { "insights": [], "riskLevel": "", "suggestions": [] }`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" }
    });

    res.json(JSON.parse(completion.choices[0].message.content));
  } catch (error) {
    res.status(500).json({ error: 'Health analysis failed' });
  }
});

// 6. Focus (Protected)
app.post('/api/transcribe', auth, upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No audio file' });

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(req.file.path),
      model: "whisper-large-v3",
    });

    fs.unlinkSync(req.file.path);
    res.json({ text: transcription.text });
  } catch (error) {
    console.error("NODE WHISPER ERROR:", error);
    res.status(500).json({ error: 'Transcription failed' });
  }
});

app.post('/api/focus-report', auth, async (req, res) => {
  try {
    const { sessionData } = req.body;
    const prompt = `Generate focus report: ${JSON.stringify(sessionData)}. Return JSON: { "focusScore": 0, "efficiencyAnalysis": "", "tips": [] }`;
    
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" }
    });

    const aiRes = JSON.parse(completion.choices[0].message.content);

    const report = new FocusReport({
      user: req.user.id,
      duration: sessionData.duration,
      distractions: sessionData.distractions,
      focusScore: aiRes.focusScore,
      analysis: aiRes.efficiencyAnalysis,
      tips: aiRes.tips
    });
    await report.save();

    res.json(aiRes);
  } catch (error) {
    res.status(500).json({ error: 'Focus report failed' });
  }
});

// 7. Dashboard Data (Aggregation)
app.get('/api/user/dashboard', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5);
    const chats = await ChatSession.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(1);
    const focusReports = await FocusReport.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5);
    
    const totalFocusTime = await FocusReport.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id) } },
      { $group: { _id: null, total: { $sum: "$duration" } } }
    ]);

    res.json({
      recentNotes: notes,
      lastChat: chats[0],
      focusStats: {
        totalSeconds: totalFocusTime[0]?.total || 0,
        recentScore: focusReports[0]?.focusScore || 0,
        history: focusReports
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Dashboard fetch failed' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
