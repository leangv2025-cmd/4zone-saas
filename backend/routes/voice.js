const express = require('express');
const router = express.Router();

const TTS_KEY = process.env.GOOGLE_API_KEY || "";

async function fetchJson(url, options) {
  const r = await fetch(url, options);
  const text = await r.text();
  const ct = (r.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) throw new Error(`Non-JSON (${r.status})`);
  const data = JSON.parse(text);
  if (!r.ok) throw new Error(data?.error?.message || `Failed (${r.status})`);
  return data;
}

router.post('/tts', async (req, res) => {
  try {
    const { text, languageCode = 'en-US', gender = 'FEMALE', voiceType = 'neural' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text required' });
    if (!TTS_KEY) return res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });

    const voicesUrl = `https://texttospeech.googleapis.com/v1/voices?key=${TTS_KEY}`;
    const voicesData = await fetchJson(voicesUrl, { method: 'GET' });
    const voices = Array.isArray(voicesData?.voices) ? voicesData.voices : [];

    const byLang = voices.filter(v => (v.languageCodes || []).includes(languageCode));
    const byGender = byLang.filter(v => String(v.ssmlGender || '').toUpperCase() === gender.toUpperCase());
    const isNeural = n => /Neural2|Wavenet/i.test(n || '');
    const chosen = voiceType === 'standard'
      ? (byGender.find(v => !isNeural(v.name)) || byGender[0] || byLang[0])
      : (byGender.find(v => isNeural(v.name)) || byGender[0] || byLang[0]);

    if (!chosen?.name) return res.status(400).json({ error: 'No voice found for this language/gender' });

    const synthUrl = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${TTS_KEY}`;
    const synthData = await fetchJson(synthUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: text.slice(0, 4000) },
        voice: { languageCode, name: chosen.name, ssmlGender: gender.toUpperCase() },
        audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0.0 },
      }),
    });

    const audioContent = synthData?.audioContent;
    if (!audioContent) return res.status(500).json({ error: 'No audio returned' });

    res.json({
      audio: audioContent,
      mimeType: 'audio/mpeg',
      voiceName: chosen.name,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/voices', async (req, res) => {
  try {
    const url = `https://texttospeech.googleapis.com/v1/voices?key=${TTS_KEY}`;
    const data = await fetchJson(url, { method: 'GET' });
    res.json({ voices: data.voices || [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
