import React from "react";

function EmailNotification({ detection }) {
  if (!detection || detection.status !== "STOLEN") return null;

  return (
    <div className="panel email-panel">
      <div className="panel-header">
        <h3 className="panel-title">📧 Email Notification Status</h3>
      </div>
      <div className="email-body">
        <div className="email-icon">✉️</div>
        <div className="email-text">
          <p className="email-main">Email alert sent to vehicle owner and authorities</p>
          <p className="email-detail">
            Notification dispatched for plate <strong>{detection.plate}</strong> detected at{" "}
            <strong>{detection.location}</strong> on <strong>{detection.time}</strong>.
          </p>
        </div>
        <span className="email-sent-tag">SENT</span>
      </div>
    </div>
  );
}

export default EmailNotification;
