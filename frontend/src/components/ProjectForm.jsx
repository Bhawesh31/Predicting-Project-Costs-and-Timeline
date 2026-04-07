import React, { useState } from "react";
import "./ProjectForm.css";

const DEFAULTS = {
  name:               "",
  type:               "substation",
  region:             "north",
  budget_cr:          0,
  terrain_score:      0.5,
  duration_months:    12,
  vendor_perf_score:  0.8,
  weather_risk_score: 0.3,
  permit_delay_days:  0,
};

export default function ProjectForm({ initialData = {}, onSubmit, submitLabel = "Submit" }) {
  const [form, setForm] = useState({ ...DEFAULTS, ...initialData });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        budget_cr:          Number(form.budget_cr),
        terrain_score:      Number(form.terrain_score),
        duration_months:    Number(form.duration_months),
        vendor_perf_score:  Number(form.vendor_perf_score),
        weather_risk_score: Number(form.weather_risk_score),
        permit_delay_days:  Number(form.permit_delay_days),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Project Name</label>
          <input required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
      </div>

      <div className="form-row two-col">
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)}>
            <option value="substation">Substation</option>
            <option value="overhead_line">Overhead Line</option>
            <option value="underground_cable">Underground Cable</option>
          </select>
        </div>
        <div className="form-group">
          <label>Region</label>
          <select value={form.region} onChange={(e) => set("region", e.target.value)}>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>
        </div>
      </div>

      <div className="form-row two-col">
        <div className="form-group">
          <label>Budget (Crore ₹)</label>
          <input type="number" min="0" step="0.01" value={form.budget_cr}
            onChange={(e) => set("budget_cr", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Duration (months)</label>
          <input type="number" min="1" value={form.duration_months}
            onChange={(e) => set("duration_months", e.target.value)} />
        </div>
      </div>

      <div className="form-row two-col">
        <div className="form-group">
          <label>Terrain Score (0–1)</label>
          <input type="number" min="0" max="1" step="0.01" value={form.terrain_score}
            onChange={(e) => set("terrain_score", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Vendor Performance (0–1)</label>
          <input type="number" min="0" max="1" step="0.01" value={form.vendor_perf_score}
            onChange={(e) => set("vendor_perf_score", e.target.value)} />
        </div>
      </div>

      <div className="form-row two-col">
        <div className="form-group">
          <label>Weather Risk (0–1)</label>
          <input type="number" min="0" max="1" step="0.01" value={form.weather_risk_score}
            onChange={(e) => set("weather_risk_score", e.target.value)} />
        </div>
        <div className="form-group">
          <label>Permit Delay (days)</label>
          <input type="number" min="0" value={form.permit_delay_days}
            onChange={(e) => set("permit_delay_days", e.target.value)} />
        </div>
      </div>

      <button type="submit" className="btn btn-primary" disabled={saving}>
        {saving ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
