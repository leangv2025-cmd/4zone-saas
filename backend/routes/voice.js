// routes/voice.js — Google Text-to-Speech
const express = require('express');
const router = express.Router();
const textToSpeech = require('@google-cloud/text-to-speech');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '{}'),
});

// GET /api/voice/voices — List available voices
router.get('/voices', async (req, res) => {
  try {
    const [result] = await client.listVoices({});
    const voices = result.voices
      .filter(v => v.languageCodes.some(l => ['en-US', 'en-GB', 'km-KH'].includes(l)))
      .map(v => ({ name: v.name, language: v.languageCodes[0], gender: v.ssmlGender }));
    res.json({ voices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch voices' });
  }
});

// POST /api/voice/tts — Text to Speech
router.post('/tts', async (req, res) => {
  try {
    const {
      text,
      voice = 'en-US-Neural2-F',
      languageCode = 'en-US',
      speakingRate = 1.0,
      pitch = 0,
      format = 'MP3',
    } = req.body;

    if (!text) return res.status(400).json({ error: 'Text is required' });
    if (text.length > 5000) return res.status(400).json({ error: 'Text too long (max 5000 chars)' });

    const request = {
      input: { text },
      voice: { languageCode, name: voice },
      audioConfig: {
        audioEncoding: format,
        speakingRate: Math.max(0.25, Math.min(4.0, speakingRate)),
        pitch: Math.max(-20, Math.min(20, pitch)),
      },
    };

    const [response] = await client.synthesizeSpeech(request);
    const audioBase64 = response.audioContent.toString('base64');

    res.json({
      audio: audioBase64,
      format: format.toLowerCase(),
      mimeType: format === 'MP3' ? 'audio/mpeg' : 'audio/wav',
    });
  } catch (err) {
    console.error('[TTS Error]', err.message);
    res.status(500).json({ error: 'Voice generation failed' });
  }
});

module.exports = router;
