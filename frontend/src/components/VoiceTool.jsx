// src/components/VoiceTool.jsx
import { useState, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "https://api.4zone.site";

const VOICES = [
  { name: "en-US-Neural2-F", label: "Emma (US Female)", lang: "en-US" },
  { name: "en-US-Neural2-D", label: "Michael (US Male)", lang: "en-US" },
  { name: "en-GB-Neural2-A", label: "Sophie (UK Female)", lang: "en-GB" },
  { name: "en-GB-Neural2-B", label: "James (UK Male)", lang: "en-GB" },
  { name: "en-US-Studio-O",  label: "Studio (US Male)", lang: "en-US" },
  { name: "en-US-Studio-Q",  label: "Studio (US Female)", lang: "en-US" },
];

export default function VoiceTool() {
  const [text, setText] = useState("");
  const [voice, setVoice] = useState(VOICES[0].name);
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(0);
  const [loading, setLoading] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);
  const [tab, setTab] = useState("text"); // "text" | "upload"
  const audioRef = useRef(null);

  const generate = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    setAudioSrc(null);
    try {
      const res = await fetch(`${API}/api/voice/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice, speakingRate: speed, pitch, format: "MP3" }),
      });
      const data = await res.json();
      if (data.audio) {
        const src = `data:audio/mpeg;base64,${data.audio}`;
        setAudioSrc(src);
        setTimeout(() => audioRef.current?.play(), 100);
      } else {
        alert("Voice generation failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      alert("Connection error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    if (!audioSrc) return;
    const a = document.createElement("a");
    a.href = audioSrc;
    a.download = "4zone-voice.mp3";
    a.click();
  };

  return (
    <div className="tool-container">
      <div className="tool-tabs">
        <button className={tab === "text" ? "tab active" : "tab"} onClick={() => setTab("text")}>
          ✏️ Text to Speech
        </button>
        <button className={tab === "upload" ? "tab active" : "tab"} onClick={() => setTab("upload")}>
          📁 File Upload
        </button>
      </div>

      {tab === "text" ? (
        <div className="tool-body">
          <label>Text to Convert</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Enter your text here... (max 5000 characters)"
            rows={6}
            maxLength={5000}
          />
          <small className="char-count">{text.length}/5000</small>

          <div className="controls-row">
            <div className="control-group">
              <label>Voice</label>
              <select value={voice} onChange={e => setVoice(e.target.value)}>
                {VOICES.map(v => (
                  <option key={v.name} value={v.name}>{v.label}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Speed: {speed}x</label>
              <input type="range" min="0.5" max="2" step="0.1" value={speed}
                onChange={e => setSpeed(parseFloat(e.target.value))} />
            </div>
            <div className="control-group">
              <label>Pitch: {pitch > 0 ? "+" : ""}{pitch}</label>
              <input type="range" min="-5" max="5" step="1" value={pitch}
                onChange={e => setPitch(parseInt(e.target.value))} />
            </div>
          </div>

          <button className="primary-btn" onClick={generate} disabled={loading || !text.trim()}>
            {loading ? "⏳ Generating..." : "🎙️ Generate Speech"}
          </button>
        </div>
      ) : (
        <div className="tool-body">
          <div className="upload-zone">
            <span>📁</span>
            <p>Upload a text file (.txt, .pdf) to convert to speech</p>
            <input type="file" accept=".txt,.pdf" onChange={e => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (file.name.endsWith(".txt")) {
                const reader = new FileReader();
                reader.onload = ev => { setText(ev.target.result); setTab("text"); };
                reader.readAsText(file);
              } else {
                alert("PDF parsing coming soon! Please use .txt files for now.");
              }
            }} />
          </div>
        </div>
      )}

      {audioSrc && (
        <div className="audio-result">
          <p>✅ Audio Generated!</p>
          <audio ref={audioRef} controls src={audioSrc} style={{ width: "100%" }} />
          <button className="secondary-btn" onClick={download}>⬇️ Download MP3</button>
        </div>
      )}
    </div>
  );
}
