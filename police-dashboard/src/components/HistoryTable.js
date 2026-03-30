import React from "react";

function HistoryTable({ history }) {
  return (
    <div className="panel history-panel">
      <div className="panel-header">
        <h3 className="panel-title">📋 Detection History Log</h3>
        <span className="panel-count">{history.length} Records</span>
      </div>

      <div className="table-scroll">
        <table className="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Plate Number</th>
              <th>Status</th>
              <th>Time</th>
              <th>Location</th>
              <th>Email Notification</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">No detection records yet.</td>
              </tr>
            ) : (
              history.map((row, i) => (
                <tr key={i} className={row.status === "STOLEN" ? "row-stolen" : ""}>
                  <td className="td-index">{i + 1}</td>
                  <td className="td-plate">{row.plate}</td>
                  <td>
                    <span className={`tbl-badge ${row.status === "STOLEN" ? "tbl-stolen" : "tbl-safe"}`}>
                      {row.status === "STOLEN" ? "⚠ STOLEN" : "✔ SAFE"}
                    </span>
                  </td>
                  <td className="td-time">{row.time}</td>
                  <td>{row.location}</td>
                  <td className={row.status === "STOLEN" ? "text-green" : "text-grey"}>
                    {row.status === "STOLEN" ? " Sent" : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryTable;
