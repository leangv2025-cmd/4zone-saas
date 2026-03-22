// src/App.jsx — 4Zone App Dashboard
import { useState, useEffect } from "react";
import ChatTool from "./components/ChatTool";
import VoiceTool from "./components/VoiceTool";
import ImageTool from "./components/ImageTool";
import VideoTool from "./components/VideoTool";
import "./styles/app.css";

const TOOLS = [
  { id: "chat",  icon: "🤖", label: "AI Chat",   color: "#7c3aed" },
  { id: "voice", icon: "🎙️", label: "Voice",     color: "#0891b2" },
  { id: "image", icon: "🎨", label: "Image Gen", color: "#059669" },
  { id: "video", icon: "🎬", label: "Video Gen", color: "#dc2626" },
];

export default function App() {
  const [active, setActive] = useState("chat");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Set active tool from URL hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (TOOLS.find(t => t.id === hash)) setActive(hash);
  }, []);

  const switchTool = (id) => {
    setActive(id);
    window.location.hash = id;
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <a href="https://4zone.site" className="logo-link">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">4<span className="accent">Zone</span></span>
          </a>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">AI Tools</p>
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              className={`nav-item ${active === tool.id ? "active" : ""}`}
              onClick={() => switchTool(tool.id)}
              style={{ "--tool-color": tool.color }}
            >
              <span className="nav-icon">{tool.icon}</span>
              <span className="nav-label-text">{tool.label}</span>
              {active === tool.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <a href="https://4zone.site/#pricing" className="upgrade-btn" target="_blank">
            🚀 Upgrade to Pro — $9/mo
          </a>
          <div className="sidebar-links">
            <a href="https://4zone.site" target="_blank">← Main Site</a>
            <button
              className="theme-toggle"
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <main className="main-content">
        <header className="app-header">
          <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
          <div className="header-title">
            <span className="header-icon">{TOOLS.find(t => t.id === active)?.icon}</span>
            <span>{TOOLS.find(t => t.id === active)?.label}</span>
          </div>
          <div className="header-right">
            <span className="plan-badge">Free Plan</span>
          </div>
        </header>

        <div className="tool-area">
          {active === "chat"  && <ChatTool />}
          {active === "voice" && <VoiceTool />}
          {active === "image" && <ImageTool />}
          {active === "video" && <VideoTool />}
        </div>
      </main>
    </div>
  );
}
