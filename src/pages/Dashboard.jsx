import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { getProjects, hotspots as fetchHotspots } from "../api";

const COLORS = ["#58a6ff", "#3fb950", "#d29922", "#f85149", "#a371f7"];

function StatCard({ label, value, sub }) {
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.78rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
      <span style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--accent)" }}>{value}</span>
      {sub && <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{sub}</span>}
    </div>
  );
}

export default function Dashboard() {
  const [projects,  setProjects]  = useState([]);
  const [hotspotList, setHotspotList] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getProjects(), fetchHotspots()])
      .then(([pRes, hRes]) => {
        setProjects(pRes.data);
        setHotspotList(hRes.data.hotspots || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard…</div>;

  const totalBudget = projects.reduce((s, p) => s + p.budget_cr, 0).toFixed(1);
  const avgDuration = projects.length
    ? (projects.reduce((s, p) => s + p.duration_months, 0) / projects.length).toFixed(1)
    : 0;

  // Region distribution
  const regionCount = {};
  projects.forEach((p) => { regionCount[p.region] = (regionCount[p.region] || 0) + 1; });
  const regionData = Object.entries(regionCount).map(([name, count]) => ({ name, count }));

  // Type distribution
  const typeCount = {};
  projects.forEach((p) => { typeCount[p.type] = (typeCount[p.type] || 0) + 1; });
  const typeData = Object.entries(typeCount).map(([name, count]) => ({ name, count }));

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard label="Total Projects"   value={projects.length}       sub="in database" />
        <StatCard label="Total Budget"     value={`₹${totalBudget} Cr`}  sub="combined budget" />
        <StatCard label="Avg Duration"     value={`${avgDuration} mo`}   sub="average project length" />
        <StatCard label="At-Risk Projects" value={hotspotList.length}    sub="risk score ≥ 0.4" />
      </div>

      {/* Charts */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
        <div className="card">
          <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>Projects by Region</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={regionData}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 12 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {regionData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>Projects by Type</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={typeData}>
              <XAxis dataKey="name" tick={{ fill: "var(--muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--muted)", fontSize: 12 }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "6px" }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {typeData.map((_, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top at-risk */}
      {hotspotList.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem", fontSize: "0.95rem" }}>Top At-Risk Projects</h3>
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Region</th>
                <th>Risk Score</th>
                <th>Level</th>
              </tr>
            </thead>
            <tbody>
              {hotspotList.slice(0, 5).map((h) => (
                <tr key={h.project_id}>
                  <td>{h.project_name}</td>
                  <td style={{ textTransform: "capitalize" }}>{h.region}</td>
                  <td>{h.risk_score}</td>
                  <td><span className={`badge badge-${h.risk_level}`}>{h.risk_level}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
