const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt,
      config: {
        numberOfVideos: 1,
        durationSeconds: 5,
        aspectRatio: '16:9',
      },
    });

    while (!operation.done) {
      await new Promise(r => setTimeout(r, 5000));
      operation = await operation.poll();
    }

    const videos = operation.response.generatedSamples.map((v, i) => ({
      index: i,
      uri: v.video.uri,
      mimeType: 'video/mp4',
    }));

    res.json({ videos, prompt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
