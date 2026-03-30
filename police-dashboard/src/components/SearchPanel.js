import React, { useState } from "react";

function SearchPanel() {
  const [query,    setQuery]    = useState("");
  const [result,   setResult]   = useState(null);
  const [searched, setSearched] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSearch = async () => {
    const plate = query.trim().toUpperCase();
    if (!plate) return;

    setLoading(true);
    setError("");
    setResult(null);
    setSearched(false);

    try {
      const response = await fetch(`http://localhost:5000/api/search?plate=${plate}`);
      const data = await response.json();

      if (data.ok) {
        setResult(data);
        setSearched(true);
      } else {
        setError(data.error || "Search failed. Please try again.");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure api.py is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const isStolen   = result && result.status === "STOLEN";
  const isNotFound = result && result.status === "NOT FOUND";

  return (
    <div className="panel search-panel">
      <div className="panel-header">
        <h3 className="panel-title">🔍 Vehicle Number Search</h3>
      </div>

      <div className="search-row">
        <input
          className="search-input"
          type="text"
          placeholder="Enter vehicle plate number (e.g. BKL34F500)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearched(false);
            setResult(null);
            setError("");
          }}
          onKeyDown={handleKeyDown}
        />
        <button className="search-btn" onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="search-error">⚠ {error}</div>
      )}

      {/* Search result */}
      {searched && result && (
        <div className={`search-result ${isStolen ? "result-stolen" : "result-notfound"}`}>
          {isStolen ? (
            <>
              <div className="result-row">
                <span className="result-key">Status</span>
                <span className="result-val text-red">⚠ STOLEN</span>
              </div>
              <div className="result-row">
                <span className="result-key">Owner Name</span>
                <span className="result-val">{result.ownerName}</span>
              </div>
              <div className="result-row">
                <span className="result-key">Vehicle Model</span>
                <span className="result-val">{result.vehicleModel}</span>
              </div>
              <div className="result-row">
                <span className="result-key">Last Detected Location</span>
                <span className="result-val">{result.lastLocation}</span>
              </div>
              <div className="result-row">
                <span className="result-key">Last Detected Time</span>
                <span className="result-val">{result.lastTime}</span>
              </div>
            </>
          ) : (
            <p className="result-notfound-text">
              ✅ No stolen record found for plate <strong>{result.plate}</strong> — Vehicle is safe.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchPanel;