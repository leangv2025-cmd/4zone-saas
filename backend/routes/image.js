const express = require('express');
const router = express.Router();
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

router.post('/generate', async (req, res) => {
  try {
    const { prompt, style = 'photorealistic' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp-image-generation',
      contents: `Create a ${style} image of: ${prompt}`,
      config: { responseModalities: ['Text', 'Image'] },
    });

    let imageData = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) imageData = part.inlineData.data;
    }

    if (imageData) {
      res.json({ images: [{ data: imageData, mimeType: 'image/png', index: 0 }], prompt });
    } else {
      res.status(500).json({ error: 'No image generated. Try different prompt.' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
