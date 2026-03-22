// src/components/VideoTool.jsx
import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://api.4zone.site";

export default function VideoTool() {
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [duration, setDuration] = useState(8);
  const [ratio, setRatio] = useState("16:9");
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setVideos([]);
    setStatus("⏳ Submitting to Google Veo... (this takes 1–3 minutes)");
    try {
      const res = await fetch(`${API}/api/video/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, negativePrompt: negative, duration, aspectRatio: ratio }),
      });
      const data = await res.json();
      if (data.videos?.length) {
        setVideos(data.videos);
        setStatus("");
      } else if (res.status === 202) {
        setStatus("⏳ Video is processing. Please check back in a few minutes.");
      } else {
        setError(data.error || "Video generation failed.");
        setStatus("");
      }
    } catch (e) {
      setError("Connection error: " + e.message);
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tool-container">
      <div className="notice-banner">
        🎬 <strong>Google Veo</strong> — Video generation requires Vertex AI access. Ensure it's enabled in your Google Cloud Console.
      </div>

      <div className="tool-body">
        <label>Video Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe your video... e.g. 'A drone shot flying over Phnom Penh at golden hour, cinematic, smooth motion'"
          rows={4}
          maxLength={1000}
        />
        <small className="char-count">{prompt.length}/1000</small>

        <label>Negative Prompt (optional)</label>
        <input
          type="text"
          value={negative}
          onChange={e => setNegative(e.target.value)}
          placeholder="Things to avoid: blurry, shaky, low quality..."
        />

        <div className="controls-row">
          <div className="control-group">
            <label>Aspect Ratio</label>
            <select value={ratio} onChange={e => setRatio(e.target.value)}>
              <option value="16:9">16:9 (Landscape)</option>
              <option value="9:16">9:16 (Portrait/Reels)</option>
            </select>
          </div>
          <div className="control-group">
            <label>Duration: {duration}s</label>
            <select value={duration} onChange={e => setDuration(parseInt(e.target.value))}>
              <option value="5">5 seconds</option>
              <option value="8">8 seconds</option>
            </select>
          </div>
        </div>

        <button className="primary-btn" onClick={generate} disabled={loading || !prompt.trim()}>
          {loading ? "⏳ Processing..." : "🎬 Generate Video"}
        </button>

        {status && <div className="status-box">{status}</div>}
        {error && <div className="error-box">❌ {error}</div>}
      </div>

      {videos.length > 0 && (
        <div className="videos-grid">
          {videos.map((v, i) => (
            <div key={i} className="video-card">
              <video controls src={v.uri} style={{ width: "100%", borderRadius: "10px" }} />
              <a className="secondary-btn" href={v.uri} download={`4zone-video-${i+1}.mp4`}>⬇️ Download Video</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
