import { useEffect, useState } from "react";
import { getProjects, getHotspots, trainModels } from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

export default function Dashboard() {
  const [projects,  setProjects]  = useState([]);
  const [hotspots,  setHotspots]  = useState([]);
  const [training,  setTraining]  = useState(false);
  const [trainMsg,  setTrainMsg]  = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), getHotspots()])
      .then(([pRes, hRes]) => {
        setProjects(pRes.data);
        setHotspots(hRes.data.hotspots);
      })
      .finally(() => setLoading(false));
  }, []);

  const byRegion = ["north", "south", "east", "west"].map((r) => ({
    region: r,
    count: projects.filter((p) => p.region === r).length,
  }));

  const byType = ["substation", "overhead_line", "underground_cable"].map((t) => ({
    type: t.replace(/_/g, " "),
    count: projects.filter((p) => p.type === t).length,
  }));

  const criticalCount = hotspots.filter((h) => h.risk_level === "critical").length;
  const highCount     = hotspots.filter((h) => h.risk_level === "high").length;

  async function handleTrain() {
    setTraining(true);
    setTrainMsg(null);
    try {
      const res = await trainModels();
      const d   = res.data;
      setTrainMsg({
        type: "success",
        text: `${d.status} — Cost MAE: ${d.cost_model_mae} | Timeline MAE: ${d.timeline_model_mae}`,
      });
    } catch (e) {
      setTrainMsg({
        type: "error",
        text: e.response?.data?.detail || "Training failed",
      });
    } finally {
      setTraining(false);
    }
  }

  if (loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Dashboard</h1>
        <button className="btn btn-success" onClick={handleTrain} disabled={training}>
          {training ? "Training…" : "🤖 Train Models"}
        </button>
      </div>

      {trainMsg && (
        <div className={`alert alert-${trainMsg.type === "success" ? "success" : "error"} mb-2`}>
          {trainMsg.text}
        </div>
      )}

      {/* KPI row */}
      <div className="grid-4 mb-3">
        <div className="card stat-card">
          <div className="label">Total Projects</div>
          <div className="value mono">{projects.length}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Risk Hotspots</div>
          <div className="value mono" style={{ color: "var(--warn)" }}>{hotspots.length}</div>
        </div>
        <div className="card stat-card">
          <div className="label">Critical</div>
          <div className="value mono" style={{ color: "var(--danger)" }}>{criticalCount}</div>
        </div>
        <div className="card stat-card">
          <div className="label">High Risk</div>
          <div className="value mono" style={{ color: "#f97316" }}>{highCount}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-3">
        <div className="card">
          <div className="mb-2" style={{ fontWeight: 600 }}>Projects by Region</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byRegion}>
              <XAxis dataKey="region" tick={{ fill: "var(--muted)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}
                labelStyle={{ color: "var(--text)" }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="mb-2" style={{ fontWeight: 600 }}>Projects by Type</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byType}>
              <XAxis dataKey="type" tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 6 }}
                labelStyle={{ color: "var(--text)" }}
                cursor={{ fill: "rgba(255,255,255,0.04)" }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byType.map((_, i) => (
                  <Cell key={i} fill={["var(--accent)", "var(--accent2)", "var(--warn)"][i % 3]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top hotspots preview */}
      {hotspots.length > 0 && (
        <div className="card">
          <div className="mb-2" style={{ fontWeight: 600 }}>Top Risk Projects</div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Region</th>
                  <th>Type</th>
                  <th>Risk Score</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {hotspots.slice(0, 5).map((h) => (
                  <tr key={h.project_id}>
                    <td className="mono" style={{ fontSize: "0.8rem" }}>{h.project_name}</td>
                    <td>{h.region}</td>
                    <td>{h.type.replace(/_/g, " ")}</td>
                    <td className="mono">{(h.risk_score * 100).toFixed(1)}%</td>
                    <td>
                      <span className={`badge badge-${h.risk_level}`}>{h.risk_level}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
