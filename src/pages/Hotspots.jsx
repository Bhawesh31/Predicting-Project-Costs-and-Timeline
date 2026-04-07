import { useEffect, useState } from "react";
import { getHotspots } from "../api";

export default function Hotspots() {
  const [hotspots, setHotspots] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    getHotspots()
      .then((res) => {
        setHotspots(res.data.hotspots);
        if (res.data.hotspots.length > 0) setSelected(res.data.hotspots[0]);
      })
      .catch(() => setError("Failed to load hotspots."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading hotspots…</div>;
  if (error)   return <div className="alert alert-error">{error}</div>;

  if (hotspots.length === 0) {
    return (
      <div>
        <h1 className="page-title">Risk Hotspots</h1>
        <div className="card text-muted" style={{ textAlign: "center", padding: "3rem" }}>
          No hotspots detected. All projects are within acceptable risk thresholds.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="page-title">Risk Hotspots</h1>

      <div className="grid-2" style={{ gap: "1.5rem" }}>
        {/* List */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {hotspots.map((h) => (
            <button
              key={h.project_id}
              onClick={() => setSelected(h)}
              style={{
                width: "100%",
                background: selected?.project_id === h.project_id ? "rgba(59,130,246,0.1)" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--border)",
                padding: "0.9rem 1.25rem",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "var(--text)",
              }}
            >
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", marginBottom: "0.25rem" }}>
                  {h.project_name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  {h.region} · {h.type.replace(/_/g, " ")}
                </div>
              </div>
              <span className={`badge badge-${h.risk_level}`}>{h.risk_level}</span>
            </button>
          ))}
        </div>

        {/* Detail */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", marginBottom: "0.75rem", color: "var(--muted)" }}>
                #{selected.project_id}
              </div>
              <div style={{ fontWeight: 700, marginBottom: "0.5rem" }}>{selected.project_name}</div>
              <div className="grid-2" style={{ gap: "0.5rem", marginTop: "0.75rem" }}>
                <div>
                  <div className="text-muted text-small">Region</div>
                  <div style={{ fontWeight: 600 }}>{selected.region}</div>
                </div>
                <div>
                  <div className="text-muted text-small">Type</div>
                  <div style={{ fontWeight: 600 }}>{selected.type.replace(/_/g, " ")}</div>
                </div>
                <div>
                  <div className="text-muted text-small">Risk Score</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.5rem",
                    color: selected.risk_level === "critical" ? "var(--danger)"
                         : selected.risk_level === "high"     ? "var(--warn)"
                         : "var(--accent)" }}>
                    {(selected.risk_score * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-muted text-small">Level</div>
                  <span className={`badge badge-${selected.risk_level}`}>{selected.risk_level}</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Risk Factors</div>
              {selected.top_factors.map((f, i) => (
                <div key={i} style={{
                  padding: "0.5rem 0.75rem",
                  background: "var(--bg)",
                  borderRadius: "var(--radius)",
                  marginBottom: "0.4rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  borderLeft: "3px solid var(--warn)",
                }}>
                  ⚠ {f}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
