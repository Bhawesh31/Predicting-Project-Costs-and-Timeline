import { useEffect, useState } from "react";
import { hotspots } from "../api";

export default function Hotspots() {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [err,     setErr]     = useState("");
  const [filter,  setFilter]  = useState("all");

  const load = () => {
    setLoading(true);
    hotspots()
      .then((r) => setList(r.data.hotspots || []))
      .catch((ex) => setErr(ex.response?.data?.detail || ex.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const visible = filter === "all" ? list : list.filter((h) => h.risk_level === filter);

  if (loading) return <div className="loading">Loading hotspots…</div>;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 className="page-title" style={{ margin: 0 }}>Risk Hotspots</h1>
        <button className="btn-secondary" onClick={load}>Refresh</button>
      </div>

      {err && <p className="error-msg" style={{ marginBottom: "1rem" }}>{err}</p>}

      {/* Filter chips */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
        {["all", "critical", "high", "medium"].map((lvl) => (
          <button
            key={lvl}
            style={{ padding: "0.3rem 0.85rem", textTransform: "capitalize" }}
            className={filter === lvl ? "btn-primary" : "btn-secondary"}
            onClick={() => setFilter(lvl)}
          >
            {lvl}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <p style={{ color: "var(--muted)" }}>
          {list.length === 0
            ? "No projects with risk score ≥ 0.4 found."
            : `No ${filter} projects.`}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {visible.map((h) => (
            <div className="card" key={h.project_id}
              style={{ borderLeft: `3px solid ${h.risk_level === "critical" ? "var(--danger)" : h.risk_level === "high" ? "var(--warn)" : "#e3b341"}` }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{h.project_name}</span>
                  <span style={{ marginLeft: "0.75rem", color: "var(--muted)", fontSize: "0.82rem", textTransform: "capitalize" }}>
                    {h.region} · {h.type.replace("_", " ")}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
                    Score: <strong>{h.risk_score}</strong>
                  </span>
                  <span className={`badge badge-${h.risk_level}`}>{h.risk_level}</span>
                </div>
              </div>
              {h.top_factors.length > 0 && (
                <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem", color: "var(--muted)", fontSize: "0.82rem" }}>
                  {h.top_factors.map((f, i) => <li key={i}>{f}</li>)}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
