// routes/image.js — Google Imagen API
const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// POST /api/image/generate
router.post('/generate', async (req, res) => {
  try {
    const {
      prompt,
      negativePrompt = '',
      numberOfImages = 1,
      aspectRatio = '1:1',
      style = 'photorealistic',
    } = req.body;

    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });
    if (prompt.length > 1000) return res.status(400).json({ error: 'Prompt too long (max 1000 chars)' });
    if (numberOfImages > 4) return res.status(400).json({ error: 'Max 4 images per request' });

    // Using Imagen 3 via Vertex AI / Generative AI
    const imageModel = genAI.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

    const enhancedPrompt = style !== 'none'
      ? `${prompt}, ${style} style, high quality, detailed`
      : prompt;

    const result = await imageModel.generateImages({
      prompt: enhancedPrompt,
      negativePrompt,
      numberOfImages,
      aspectRatio,
    });

    const images = result.images.map((img, i) => ({
      index: i,
      data: img.imageBytes,
      mimeType: img.mimeType || 'image/png',
    }));

    res.json({ images, prompt: enhancedPrompt });
  } catch (err) {
    console.error('[Image Error]', err.message);
    // Fallback: return error with helpful message
    res.status(500).json({
      error: 'Image generation failed',
      details: err.message,
      hint: 'Ensure Imagen API is enabled in Google Cloud Console',
    });
  }
});

// POST /api/image/describe — Analyze/describe an image with Gemini Vision
router.post('/describe', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt = 'Describe this image in detail.' } = req.body;
    if (!imageBase64) return res.status(400).json({ error: 'Image data required' });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      { inlineData: { data: imageBase64, mimeType } },
      { text: prompt },
    ]);
    res.json({ description: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

module.exports = router;
