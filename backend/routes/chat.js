// routes/chat.js — Google Gemini AI Chat
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// POST /api/chat — Send message to Gemini
router.post('/', async (req, res) => {
  try {
    const { message, history = [], model = 'gemini-1.5-flash' } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const genModel = genAI.getGenerativeModel({ model });
    const chat = genModel.startChat({
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
      generationConfig: { maxOutputTokens: 2048, temperature: 0.8 },
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    res.json({ message: response, model });
  } catch (err) {
    console.error('[Chat Error]', err.message);
    res.status(500).json({ error: 'AI chat failed. Please try again.' });
  }
});

// POST /api/chat/stream — Streaming response
router.post('/stream', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const genModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const chat = genModel.startChat({ history: history.map(h => ({ role: h.role, parts: [{ text: h.content }] })) });
    const result = await chat.sendMessageStream(message);

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
