import React from "react";

function StatsBar({ stats }) {
  const cards = [
    { label: "Total Vehicles Scanned", value: stats.totalScanned, icon: "🚗", color: "stat-blue" },
    { label: "Stolen Vehicles Detected", value: stats.stolenDetected, icon: "⚠️", color: "stat-red" },
    { label: "Active Cameras", value: stats.activeCameras, icon: "📷", color: "stat-green" },
    { label: "Alerts Sent Today", value: stats.alertsSent, icon: "📧", color: "stat-orange" },
  ];

  return (
    <section className="stats-bar">
      {cards.map((card, i) => (
        <div className={`stat-card ${card.color}`} key={i}>
          <div className="stat-icon">{card.icon}</div>
          <div className="stat-info">
            <span className="stat-value">{card.value}</span>
            <span className="stat-label">{card.label}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export default StatsBar;
