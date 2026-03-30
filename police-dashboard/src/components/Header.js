import React from "react";

function Header() {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <header className="header">
      <div className="header-left">
        <div className="emblem">🔵</div>
        <div className="header-text">
          <h1 className="header-title">AI Stolen Vehicle Monitoring System</h1>
          <p className="header-subtitle">Surveillance Command Dashboard</p>
        </div>
      </div>
      <div className="header-right">
        <div className="header-meta">
          <span className="live-badge">● LIVE</span>
          <span className="header-date">{dateStr}</span>
          <span className="header-time">{timeStr}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
