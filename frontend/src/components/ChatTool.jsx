// src/components/ChatTool.jsx
import { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "https://api.4zone.site";

export default function ChatTool() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Hello! I'm your AI assistant powered by Google Gemini. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        content: m.content,
      }));

      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.message || data.error }]);
    } catch {
      setMessages(m => [...m, { role: "assistant", content: "❌ Connection error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clear = () => setMessages([{ role: "assistant", content: "Chat cleared! How can I help you?" }]);

  return (
    <div className="chat-container">
      <div className="chat-header">
        <span>🤖 Gemini AI Chat</span>
        <button className="icon-btn" onClick={clear} title="Clear chat">🗑️</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg ${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === "assistant" ? "🤖" : "👤"}
            </div>
            <div className="msg-bubble">
              <pre className="msg-text">{msg.content}</pre>
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg assistant">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
          rows={2}
          disabled={loading}
        />
        <button className="send-btn" onClick={send} disabled={loading || !input.trim()}>
          {loading ? "⏳" : "➤"}
        </button>
      </div>
    </div>
  );
}
