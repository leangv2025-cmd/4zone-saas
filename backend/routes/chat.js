const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(message);
    res.json({ message: result.response.text() });
  } catch (err) {
    console.error('[Chat Error]', err.message);
    res.status(500).json({ error: 'AI chat failed: ' + err.message });
  }
});

module.exports = router;
