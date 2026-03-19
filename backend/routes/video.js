// routes/video.js — Google Veo API (Video Generation)
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// POST /api/video/generate
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt = '',
      duration = 8,          // seconds: 5 or 8
      aspectRatio = '16:9',  // 16:9 or 9:16
      resolution = '720p',
    } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    if (prompt.length > 1000) return res.status(400).json({ error: 'Prompt too long (max 1000 chars)' });

    // Google Veo 2 via Vertex AI
    const videoModel = genAI.getGenerativeModel({ model: 'veo-2.0-generate-001' });

    const operation = await videoModel.generateVideos({
      prompt,
      negativePrompt,
      generationConfig: {
        durationSeconds: duration <= 8 ? 8 : 16,
        aspectRatio,
      },
    });

    // Poll until done (Veo is async)
    let result = operation;
    let attempts = 0;
    while (!result.done && attempts < 30) {
      await new Promise(r => setTimeout(r, 5000)); // wait 5s
      result = await operation.poll();
      attempts++;
    }

    if (!result.done) {
      return res.status(202).json({ status: 'processing', message: 'Video is still being generated. Check back in a moment.' });
    }

    const videos = result.response.generatedSamples.map((v, i) => ({
      index: i,
      uri: v.video.uri,
      mimeType: v.video.mimeType || 'video/mp4',
    }));

    res.json({ videos, prompt });
  } catch (err) {
    console.error('[Video Error]', err.message);
    res.status(500).json({
      error: 'Video generation failed',
      details: err.message,
      hint: 'Ensure Veo API access is enabled. Video generation may require Vertex AI setup.',
    });
  }
});

// GET /api/video/status/:operationId — Check video status
router.get('/status/:operationId', async (req, res) => {
  try {
    const { operationId } = req.params;
    // In production, store operation references and poll here
    res.json({ operationId, status: 'polling_not_implemented_yet' });
  } catch (err) {
    res.status(500).json({ error: 'Status check failed' });
  }
});

module.exports = router;
