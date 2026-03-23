const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

router.post('/generate', async (req, res) => {
  try {
    const { prompt, style = 'photorealistic' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: `${prompt}, ${style} style, high quality`,
      config: { numberOfImages: 1 },
    });

    const images = response.generatedImages.map((img, i) => ({
      index: i,
      data: img.image.imageBytes,
      mimeType: 'image/png',
    }));

    res.json({ images, prompt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
