import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import "./Dashboard.css";

const RISK_COLORS = { critical: "#ef4444", high: "#f59e0b", medium: "#3b82f6" };

export default function Dashboard() {
  const [hotspots, setHotspots]   = useState([]);
  const [projects, setProjects]   = useState([]);
  const [training, setTraining]   = useState(false);
  const [trainMsg, setTrainMsg]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get("/api/hotspots"),
      axios.get("/api/projects"),
    ])
      .then(([h, p]) => {
        setHotspots(h.data.hotspots);
        setProjects(p.data);
      })
      .catch(() => setError("Could not connect to backend. Is it running?"))
      .finally(() => setLoading(false));
  }, []);

  const handleTrain = async () => {
    setTraining(true);
    setTrainMsg(null);
    try {
      const res = await axios.post("/api/train");
      setTrainMsg(`✅ ${res.data.status} — Cost MAE: ${res.data.cost_model_mae}, Timeline MAE: ${res.data.timeline_model_mae}`);
    } catch (e) {
      setTrainMsg(`❌ ${e.response?.data?.detail || e.message}`);
    } finally {
      setTraining(false);
    }
  };

  const chartData = hotspots.map((h) => ({
    name: h.project_name.split(" ").slice(0, 2).join(" "),
    risk: h.risk_score,
    level: h.risk_level,
  }));

  return (
    <div>
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="dashboard-actions">
          <button className="btn btn-primary" onClick={handleTrain} disabled={training}>
            {training ? "Training…" : "🔄 Retrain ML Models"}
          </button>
        </div>
      </div>

      {trainMsg && <div className="alert">{trainMsg}</div>}
      {error    && <div className="alert alert-error">{error}</div>}

      {/* Summary stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total Projects</span>
          <span className="stat-value">{projects.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">High-Risk Projects</span>
          <span className="stat-value red">{hotspots.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Critical</span>
          <span className="stat-value red">{hotspots.filter((h) => h.risk_level === "critical").length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Avg Budget (Cr)</span>
          <span className="stat-value">
            {projects.length
              ? Math.round(projects.reduce((s, p) => s + p.budget_cr, 0) / projects.length)
              : "—"}
          </span>
        </div>
      </div>

      {/* Risk chart */}
      {!loading && chartData.length > 0 && (
        <div className="card chart-card">
          <h2 className="section-title">Project Risk Scores</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 40, left: 0 }}>
              <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} domain={[0, 1]} />
              <Tooltip
                contentStyle={{ background: "#131626", border: "1px solid #1e2340", borderRadius: 6 }}
                labelStyle={{ color: "#e2e8f0" }}
              />
              <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={RISK_COLORS[entry.level] || "#3b82f6"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Hotspot table */}
      <div className="card">
        <h2 className="section-title">Risk Hotspots</h2>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : hotspots.length === 0 ? (
          <p className="muted">No high-risk projects detected.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Region</th>
                <th>Type</th>
                <th>Risk Score</th>
                <th>Level</th>
                <th>Top Factors</th>
              </tr>
            </thead>
            <tbody>
              {hotspots.map((h) => (
                <tr key={h.project_id}>
                  <td>{h.project_name}</td>
                  <td>{h.region}</td>
                  <td>{h.type}</td>
                  <td>{h.risk_score}</td>
                  <td>
                    <span className={`badge badge-${h.risk_level}`}>{h.risk_level}</span>
                  </td>
                  <td className="factors">{h.top_factors.join("; ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
