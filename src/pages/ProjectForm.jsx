import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject, createProject, updateProject } from "../api";

const DEFAULTS = {
  name:               "",
  type:               "substation",
  region:             "north",
  budget_cr:          500,
  terrain_score:      0.5,
  duration_months:    12,
  vendor_perf_score:  0.8,
  weather_risk_score: 0.3,
  permit_delay_days:  30,
};

export default function ProjectForm() {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const isEdit        = Boolean(id);
  const [form,    setForm]    = useState(DEFAULTS);
  const [loading, setLoading] = useState(isEdit);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getProject(id)
      .then((res) => setForm(res.data))
      .catch(() => setError("Project not found."))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  function handleChange(e) {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (isEdit) {
        await updateProject(id, form);
      } else {
        await createProject(form);
      }
      navigate("/projects");
    } catch (err) {
      setError(err.response?.data?.detail || "Save failed.");
      setSaving(false);
    }
  }

  if (loading) return <div className="loading">Loading project…</div>;

  return (
    <div>
      <h1 className="page-title">{isEdit ? "Edit Project" : "New Project"}</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Name */}
            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
              <label>Project Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. PGCIL-NR-4412 Rajasthan-Agra 765kV"
                required
              />
            </div>

            {/* Type */}
            <div className="form-group">
              <label>Type</label>
              <select name="type" value={form.type} onChange={handleChange}>
                <option value="substation">Substation</option>
                <option value="overhead_line">Overhead Line</option>
                <option value="underground_cable">Underground Cable</option>
              </select>
            </div>

            {/* Region */}
            <div className="form-group">
              <label>Region</label>
              <select name="region" value={form.region} onChange={handleChange}>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
              </select>
            </div>

            {/* Budget */}
            <div className="form-group">
              <label>Budget (Crore INR)</label>
              <input
                type="number" name="budget_cr"
                value={form.budget_cr} onChange={handleChange}
                min="0" step="0.01" required
              />
            </div>

            {/* Duration */}
            <div className="form-group">
              <label>Duration (months)</label>
              <input
                type="number" name="duration_months"
                value={form.duration_months} onChange={handleChange}
                min="1" required
              />
            </div>

            {/* Terrain score */}
            <div className="form-group">
              <label>Terrain Score (0 = flat, 1 = very difficult)</label>
              <input
                type="number" name="terrain_score"
                value={form.terrain_score} onChange={handleChange}
                min="0" max="1" step="0.01"
              />
            </div>

            {/* Vendor perf */}
            <div className="form-group">
              <label>Vendor Performance (0 = poor, 1 = excellent)</label>
              <input
                type="number" name="vendor_perf_score"
                value={form.vendor_perf_score} onChange={handleChange}
                min="0" max="1" step="0.01"
              />
            </div>

            {/* Weather risk */}
            <div className="form-group">
              <label>Weather Risk (0 = safe, 1 = high risk)</label>
              <input
                type="number" name="weather_risk_score"
                value={form.weather_risk_score} onChange={handleChange}
                min="0" max="1" step="0.01"
              />
            </div>

            {/* Permit delay */}
            <div className="form-group">
              <label>Permit Delay (days)</label>
              <input
                type="number" name="permit_delay_days"
                value={form.permit_delay_days} onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving…" : isEdit ? "Update Project" : "Create Project"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => navigate("/projects")}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
