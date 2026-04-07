import { useEffect, useState } from "react";
import { getProjects, createProject, updateProject, deleteProject } from "../api";

const EMPTY = {
  name: "", type: "substation", region: "north",
  budget_cr: "", terrain_score: "", duration_months: "",
  vendor_perf_score: "", weather_risk_score: "", permit_delay_days: "",
};

function ProjectForm({ initial = EMPTY, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const [err,  setErr]  = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const payload = {
        ...form,
        budget_cr:          parseFloat(form.budget_cr),
        terrain_score:      parseFloat(form.terrain_score),
        duration_months:    parseInt(form.duration_months),
        vendor_perf_score:  parseFloat(form.vendor_perf_score),
        weather_risk_score: parseFloat(form.weather_risk_score),
        permit_delay_days:  parseInt(form.permit_delay_days),
      };
      await onSave(payload);
    } catch (ex) {
      setErr(ex.response?.data?.detail || ex.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div className="form-row">
        <div className="form-group">
          <label>Project Name</label>
          <input value={form.name} onChange={set("name")} required placeholder="PGCIL-NR-4412 …" />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select value={form.type} onChange={set("type")}>
            <option value="substation">Substation</option>
            <option value="overhead_line">Overhead Line</option>
            <option value="underground_cable">Underground Cable</option>
          </select>
        </div>
        <div className="form-group">
          <label>Region</label>
          <select value={form.region} onChange={set("region")}>
            <option value="north">North</option>
            <option value="south">South</option>
            <option value="east">East</option>
            <option value="west">West</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Budget (₹ Crore)</label>
          <input type="number" step="0.01" value={form.budget_cr} onChange={set("budget_cr")} required placeholder="1200" />
        </div>
        <div className="form-group">
          <label>Duration (months)</label>
          <input type="number" value={form.duration_months} onChange={set("duration_months")} required placeholder="24" />
        </div>
        <div className="form-group">
          <label>Permit Delay (days)</label>
          <input type="number" value={form.permit_delay_days} onChange={set("permit_delay_days")} required placeholder="30" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Terrain Score (0–1)</label>
          <input type="number" step="0.01" min="0" max="1" value={form.terrain_score} onChange={set("terrain_score")} required placeholder="0.5" />
        </div>
        <div className="form-group">
          <label>Vendor Perf. Score (0–1)</label>
          <input type="number" step="0.01" min="0" max="1" value={form.vendor_perf_score} onChange={set("vendor_perf_score")} required placeholder="0.75" />
        </div>
        <div className="form-group">
          <label>Weather Risk Score (0–1)</label>
          <input type="number" step="0.01" min="0" max="1" value={form.weather_risk_score} onChange={set("weather_risk_score")} required placeholder="0.3" />
        </div>
      </div>

      {err && <p className="error-msg">{err}</p>}

      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button type="submit" className="btn-primary">Save Project</button>
        {onCancel && <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);   // null | "new" | project object
  const [msg,      setMsg]      = useState("");

  const load = () =>
    getProjects()
      .then((r) => setProjects(r.data))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async (data) => {
    await createProject(data);
    setEditing(null);
    setMsg("Project created.");
    load();
  };

  const handleUpdate = async (data) => {
    await updateProject(editing.id, data);
    setEditing(null);
    setMsg("Project updated.");
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await deleteProject(id);
    setMsg("Project deleted.");
    load();
  };

  if (loading) return <div className="loading">Loading projects…</div>;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Projects</h1>
        <button className="btn-primary" onClick={() => setEditing("new")}>+ New Project</button>
      </div>

      {msg && <p className="success-msg" style={{ marginBottom: "1rem" }}>{msg}</p>}

      {editing === "new" && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>New Project</h3>
          <ProjectForm onSave={handleCreate} onCancel={() => setEditing(null)} />
        </div>
      )}

      {editing && editing !== "new" && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h3 style={{ marginBottom: "1rem" }}>Edit Project #{editing.id}</h3>
          <ProjectForm initial={editing} onSave={handleUpdate} onCancel={() => setEditing(null)} />
        </div>
      )}

      {projects.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>No projects yet. Create one or use the Upload page to import from CSV/Excel.</p>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Type</th>
                <th>Region</th>
                <th>Budget (Cr)</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id}>
                  <td style={{ color: "var(--muted)" }}>{p.id}</td>
                  <td>{p.name}</td>
                  <td style={{ textTransform: "capitalize" }}>{p.type.replace("_", " ")}</td>
                  <td style={{ textTransform: "capitalize" }}>{p.region}</td>
                  <td>₹{p.budget_cr}</td>
                  <td>{p.duration_months} mo</td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn-secondary" style={{ padding: "0.3rem 0.7rem" }}
                        onClick={() => setEditing(p)}>Edit</button>
                      <button className="btn-danger" style={{ padding: "0.3rem 0.7rem" }}
                        onClick={() => handleDelete(p.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
