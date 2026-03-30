import React, { useState } from "react";

const emptyForm = { plate: "", ownerName: "", ownerEmail: "", vehicleModel: "" };

function AddVehicleForm() {
  const [form, setForm]         = useState(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSubmitted(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { plate, ownerName, ownerEmail, vehicleModel } = form;

    // Frontend validation
    if (!plate || !ownerName || !ownerEmail || !vehicleModel) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/add-vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plate:        plate.trim().toUpperCase(),
          ownerName:    ownerName.trim(),
          ownerEmail:   ownerEmail.trim(),
          vehicleModel: vehicleModel.trim(),
        }),
      });

      const result = await response.json();

      if (result.ok) {
        setSubmitted(true);
        setForm(emptyForm);
      } else {
        setError(result.error || "Failed to register vehicle. Please try again.");
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure api.py is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel form-panel">
      <div className="panel-header">
        <h3 className="panel-title"> Register Stolen Vehicle</h3>
      </div>

      {submitted && (
        <div className="form-success">
           Vehicle registered successfully in the stolen vehicle database.
        </div>
      )}

      {error && (
        <div className="form-error">
          ⚠ {error}
        </div>
      )}

      <form className="add-form" onSubmit={handleSubmit}>
        <div className="form-grid">

          <div className="form-field">
            <label>Plate Number *</label>
            <input
              name="plate"
              value={form.plate}
              onChange={handleChange}
              placeholder="e.g. KL34F500"
              className="form-input"
              autoComplete="off"
            />
          </div>

          <div className="form-field">
            <label>Vehicle Model *</label>
            <input
              name="vehicleModel"
              value={form.vehicleModel}
              onChange={handleChange}
              placeholder="e.g. Hyundai i10"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label>Owner Name *</label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              placeholder="Full name of owner"
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label>Owner Email *</label>
            <input
              name="ownerEmail"
              value={form.ownerEmail}
              onChange={handleChange}
              placeholder="owner@email.com"
              className="form-input"
              type="email"
            />
          </div>

        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? "Submitting..." : "Submit to Database"}
        </button>
      </form>
    </div>
  );
}

export default AddVehicleForm;