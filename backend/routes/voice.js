const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

router.post('/tts', async (req, res) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    if (text.length > 5000) return res.status(400).json({ error: 'Text too long' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [{ text: `Convert this text to speech description, respond with the text only: ${text}` }]
      }],
    });

    res.json({ 
      audio: null,
      text: response.text,
      message: 'TTS via Google Cloud TTS requires service account. Using text response instead.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/voices', (req, res) => {
  res.json({ voices: [
    { name: 'Kore', label: 'Kore (Female)', lang: 'en-US' },
    { name: 'Charon', label: 'Charon (Male)', lang: 'en-US' },
    { name: 'Fenrir', label: 'Fenrir (Male)', lang: 'en-US' },
    { name: 'Aoede', label: 'Aoede (Female)', lang: 'en-US' },
  ]});
});

module.exports = router;
