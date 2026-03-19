// src/components/ImageTool.jsx
import { useState } from "react";

const API = import.meta.env.VITE_API_URL || "https://api.4zone.store";

const STYLES = ["photorealistic","cinematic","digital art","oil painting","watercolor","anime","sketch","3D render","minimalist","abstract"];
const RATIOS = ["1:1","16:9","9:16","4:3","3:4"];

export default function ImageTool() {
  const [prompt, setPrompt] = useState("");
  const [negative, setNegative] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [ratio, setRatio] = useState("1:1");
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError("");
    setImages([]);
    try {
      const res = await fetch(`${API}/api/image/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, negativePrompt: negative, style, aspectRatio: ratio, numberOfImages: count }),
      });
      const data = await res.json();
      if (data.images?.length) {
        setImages(data.images);
      } else {
        setError(data.error || "Generation failed. Check your API key and Imagen access.");
      }
    } catch (e) {
      setError("Connection error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const download = (img, i) => {
    const a = document.createElement("a");
    a.href = `data:${img.mimeType};base64,${img.data}`;
    a.download = `4zone-image-${i + 1}.png`;
    a.click();
  };

  return (
    <div className="tool-container">
      <div className="tool-body">
        <label>Image Prompt</label>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe the image you want to create... e.g. 'A futuristic city at sunset with flying cars'"
          rows={4}
          maxLength={1000}
        />
        <small className="char-count">{prompt.length}/1000</small>

        <label>Negative Prompt (optional)</label>
        <input
          type="text"
          value={negative}
          onChange={e => setNegative(e.target.value)}
          placeholder="Things to exclude: blurry, distorted, watermark..."
        />

        <div className="controls-row">
          <div className="control-group">
            <label>Style</label>
            <select value={style} onChange={e => setStyle(e.target.value)}>
              {STYLES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="control-group">
            <label>Aspect Ratio</label>
            <select value={ratio} onChange={e => setRatio(e.target.value)}>
              {RATIOS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="control-group">
            <label>Count: {count}</label>
            <input type="range" min="1" max="4" step="1" value={count}
              onChange={e => setCount(parseInt(e.target.value))} />
          </div>
        </div>

        <button className="primary-btn" onClick={generate} disabled={loading || !prompt.trim()}>
          {loading ? "⏳ Generating..." : "🎨 Generate Image"}
        </button>

        {error && <div className="error-box">❌ {error}</div>}
      </div>

      {images.length > 0 && (
        <div className="images-grid">
          {images.map((img, i) => (
            <div key={i} className="image-card">
              <img src={`data:${img.mimeType};base64,${img.data}`} alt={`Generated ${i + 1}`} />
              <button className="secondary-btn" onClick={() => download(img, i)}>⬇️ Download</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
