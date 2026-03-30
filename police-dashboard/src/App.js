import React, { useState, useEffect } from "react";
import "./App.css";
import Header          from "./components/Header";
import StatsBar        from "./components/StatsBar";
import AlertBox        from "./components/AlertBox";
import DetectionPanel  from "./components/DetectionPanel";
import SearchPanel     from "./components/SearchPanel";
import AddVehicleForm  from "./components/AddVehicleForm";
import HistoryTable    from "./components/HistoryTable";
import EmailNotification from "./components/EmailNotification";

const defaultDetection = {
  plate: "—", status: "WAITING", location: "—",
  latitude: null, longitude: null, time: "—",
};

function App() {
  const [detection, setDetection] = useState(defaultDetection);
  const [history,   setHistory]   = useState([]);

  // Poll Flask backend every 2 seconds
  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:5000/api/latest")
        .then((r) => r.json())
        .then((data) => setDetection(data))
        .catch(() => {});

      fetch("http://localhost:5000/api/history")
        .then((r) => r.json())
        .then((data) => setHistory(data))
        .catch(() => {});
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Stats derived from history — accurate, never double-counts
  const stats = {
    totalScanned:   history.length,
    stolenDetected: history.filter((h) => h.status === "STOLEN").length,
    activeCameras:  1,
    alertsSent:     history.filter((h) => h.status === "STOLEN").length,
  };

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        <StatsBar stats={stats} />
        <AlertBox detection={detection} />
        <EmailNotification detection={detection} />

        <div className="two-col">
          <DetectionPanel detection={detection} />
          <SearchPanel />
        </div>

        <AddVehicleForm />
        <HistoryTable history={history} />
      </main>

      <footer className="footer">
        <p>Tamil Nadu Police Department · AI Stolen Vehicle Monitoring System · Confidential — Authorized Personnel Only</p>
      </footer>
    </div>
  );
}

export default App;