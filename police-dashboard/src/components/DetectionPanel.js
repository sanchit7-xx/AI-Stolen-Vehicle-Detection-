import React from "react";

function DetectionPanel({ detection }) {
  const isStolen = detection.status === "STOLEN";
  const isWaiting = detection.status === "WAITING";

  return (
    <div className="panel detection-panel">
      <div className="panel-header">
        <h3 className="panel-title">📡 Live Detection Feed</h3>
        <span className={`panel-badge ${isWaiting ? "badge-waiting" : isStolen ? "badge-stolen" : "badge-safe"}`}>
          {isWaiting ? "STANDBY" : detection.status}
        </span>
      </div>

      <div className="detection-grid">
        <div className="detection-field">
          <label>Plate Number</label>
          <div className={`plate-number ${isStolen ? "plate-stolen" : isWaiting ? "" : "plate-safe"}`}>
            {detection.plate}
          </div>
        </div>

        <div className="detection-field">
          <label>Detection Status</label>
          <div className={`field-value ${isStolen ? "text-red" : isWaiting ? "text-grey" : "text-green"}`}>
            {isWaiting ? "Awaiting scan..." : detection.status}
          </div>
        </div>

        <div className="detection-field">
          <label>Camera Location</label>
          <div className="field-value">{detection.location || "—"}</div>
        </div>

        <div className="detection-field">
          <label>Time of Detection</label>
          <div className="field-value">{detection.time || "—"}</div>
        </div>

        <div className="detection-field">
          <label>Owner Notification</label>
          <div className={`field-value ${isStolen ? "text-green" : "text-grey"}`}>
            {isStolen ? "✔ Email Sent to Owner & Authorities" : "—"}
          </div>
        </div>

        <div className="detection-field">
          <label>Coordinates</label>
          <div className="field-value">
            {detection.latitude && detection.longitude
              ? `${detection.latitude}°N, ${detection.longitude}°E`
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetectionPanel;
