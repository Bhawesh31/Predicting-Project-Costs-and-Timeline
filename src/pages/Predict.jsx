import { useEffect, useState } from "react";
import { getProjects, predict, trainModels } from "../api";

function ResultCard({ result }) {
  return (
    <div className="card" style={{ marginTop: "1.5rem" }}>
      <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>Prediction Result</h3>
      <p style={{ marginBottom: "0.5rem" }}>
        <strong>Project:</strong> {result.project_name}
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
        <div className="card" style={{ background: "var(--bg)", textAlign: "center" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
            Cost Overrun
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: result.cost_overrun_pct > 20 ? "var(--danger)" : result.cost_overrun_pct > 10 ? "var(--warn)" : "var(--accent2)" }}>
            {result.cost_overrun_pct}%
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>predicted overrun</div>
        </div>
        <div className="card" style={{ background: "var(--bg)", textAlign: "center" }}>
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.4rem" }}>
            Delay
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 700, color: result.delay_days > 90 ? "var(--danger)" : result.delay_days > 30 ? "var(--warn)" : "var(--accent2)" }}>
            {result.delay_days}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>predicted extra days</div>
        </div>
      </div>
    </div>
  );
}

export default function Predict() {
  const [projects,  setProjects]  = useState([]);
  const [selected,  setSelected]  = useState("");
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [training,  setTraining]  = useState(false);
  const [trainMsg,  setTrainMsg]  = useState("");
  const [err,       setErr]       = useState("");

  useEffect(() => {
    getProjects().then((r) => {
      setProjects(r.data);
      if (r.data.length) setSelected(String(r.data[0].id));
    });
  }, []);

  const handlePredict = async () => {
    if (!selected) return;
    setLoading(true); setErr(""); setResult(null);
    try {
      const res = await predict(selected);
      setResult(res.data);
    } catch (ex) {
      setErr(ex.response?.data?.detail || ex.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTrain = async () => {
    setTraining(true); setTrainMsg(""); setErr("");
    try {
      const res = await trainModels();
      const d = res.data;
      setTrainMsg(`✓ ${d.status} — Cost MAE: ${d.cost_model_mae} | Timeline MAE: ${d.timeline_model_mae} | Projects used: ${d.projects_used}`);
    } catch (ex) {
      setErr(ex.response?.data?.detail || ex.message);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Cost & Timeline Prediction</h1>

      <div className="card" style={{ maxWidth: "520px" }}>
        <div className="form-group" style={{ marginBottom: "1rem" }}>
          <label>Select Project</label>
          <select value={selected} onChange={(e) => { setSelected(e.target.value); setResult(null); }}>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>#{p.id} — {p.name}</option>
            ))}
          </select>
        </div>

        <button className="btn-primary" onClick={handlePredict} disabled={!selected || loading}>
          {loading ? "Running…" : "Run Prediction"}
        </button>

        {err && <p className="error-msg">{err}</p>}
      </div>

      {result && <ResultCard result={result} />}

      <div className="card" style={{ marginTop: "2rem", maxWidth: "520px" }}>
        <h3 style={{ marginBottom: "0.75rem", fontSize: "0.95rem" }}>Train / Retrain Models</h3>
        <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginBottom: "1rem" }}>
          Requires at least 5 projects. Retrains the Gradient Boosting models on all current data.
        </p>
        <button className="btn-secondary" onClick={handleTrain} disabled={training}>
          {training ? "Training…" : "Train Models"}
        </button>
        {trainMsg && <p className="success-msg" style={{ marginTop: "0.75rem" }}>{trainMsg}</p>}
      </div>
    </div>
  );
}
