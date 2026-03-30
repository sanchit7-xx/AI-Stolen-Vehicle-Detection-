import React from "react";

function AlertBox({ detection }) {
  if (!detection || detection.status === "WAITING") return null;

  const isStolen = detection.status === "STOLEN";

  return (
    <div className={`alert-box ${isStolen ? "alert-stolen" : "alert-safe"}`}>
      <div className="alert-icon-wrap">
        {isStolen ? "🚨" : "✅"}
      </div>
      <div className="alert-body">
        <h2 className="alert-heading">
          {isStolen ? "STOLEN VEHICLE DETECTED" : "VEHICLE CLEARED — NO THREAT"}
        </h2>
        <p className="alert-detail">
          {isStolen
            ? `Plate ${detection.plate} has been flagged as stolen. Immediate action required.`
            : `Plate ${detection.plate} is not listed in the stolen vehicle registry.`}
        </p>
      </div>
      {isStolen && (
        <div className="alert-actions">
          <span className="alert-tag">ACTION REQUIRED</span>
        </div>
      )}
    </div>
  );
}

export default AlertBox;
