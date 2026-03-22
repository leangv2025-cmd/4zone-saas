const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    
    const validHistory = history
      .filter(h => h.role === 'user' || h.role === 'model')
      .map(h => ({
        role: h.role,
        parts: [{ text: h.content }],
      }));

    const chat = model.startChat({
      history: validHistory,
      generationConfig: { maxOutputTokens: 2048 },
    });

    const result = await chat.sendMessage(message);
    res.json({ message: result.response.text() });
  } catch (err) {
    console.error('[Chat Error]', err.message);
    res.status(500).json({ error: 'AI chat failed: ' + err.message });
  }
});

module.exports = router;
