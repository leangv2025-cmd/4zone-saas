const express = require('express');
const router = express.Router();

const GEMINI_KEY = process.env.GOOGLE_API_KEY || "";
const IMAGEN_MODEL = "imagen-4.0-generate-001";

async function fetchJson(url, options) {
  const r = await fetch(url, options);
  const text = await r.text();
  const ct = (r.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) throw new Error(`Non-JSON (${r.status}): ${text.slice(0,200)}`);
  const data = JSON.parse(text);
  if (!r.ok) throw new Error(data?.error?.message || `Failed (${r.status})`);
  return data;
}

function extractB64(data) {
  return data?.predictions?.[0]?.bytesBase64Encoded ||
    data?.predictions?.[0]?.image?.bytesBase64Encoded ||
    data?.predictions?.[0]?.imageBytes || "";
}

router.post('/generate', async (req, res) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    if (!GEMINI_KEY) return res.status(500).json({ error: 'Missing GOOGLE_API_KEY' });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict`;

    const data = await fetchJson(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_KEY,
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio, personGeneration: 'allow_adult' },
      }),
    });

    const b64 = extractB64(data);
    if (!b64) return res.status(500).json({ error: 'No image returned. Try simpler prompt.' });

    res.json({ images: [{ data: b64, mimeType: 'image/png', index: 0 }], prompt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
