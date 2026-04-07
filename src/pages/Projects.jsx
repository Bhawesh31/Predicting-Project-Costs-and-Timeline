import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects, deleteProject, predict } from "../api";

export default function Projects() {
  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [predictions, setPredictions] = useState({});
  const [loadingPred, setLoadingPred] = useState({});
  const [error,       setError]       = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const res = await getProjects();
      setProjects(res.data);
    } catch {
      setError("Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this project?")) return;
    try {
      await deleteProject(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setPredictions((prev) => { const c = { ...prev }; delete c[id]; return c; });
    } catch {
      alert("Failed to delete project.");
    }
  }

  async function handlePredict(id) {
    setLoadingPred((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await predict(id);
      setPredictions((prev) => ({ ...prev, [id]: res.data }));
    } catch {
      alert("Prediction failed.");
    } finally {
      setLoadingPred((prev) => ({ ...prev, [id]: false }));
    }
  }

  if (loading) return <div className="loading">Loading projects…</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Projects</h1>
        <Link to="/projects/new" className="btn btn-primary">+ New Project</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {projects.length === 0 ? (
        <div className="card text-muted" style={{ textAlign: "center", padding: "3rem" }}>
          No projects yet.{" "}
          <Link to="/projects/new" style={{ color: "var(--accent)" }}>Create one</Link> or{" "}
          <Link to="/upload"       style={{ color: "var(--accent)" }}>upload data</Link>.
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Region</th>
                  <th>Budget (Cr)</th>
                  <th>Duration</th>
                  <th>Cost Overrun</th>
                  <th>Delay</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const pred = predictions[p.id];
                  const busy = loadingPred[p.id];
                  return (
                    <tr key={p.id}>
                      <td className="mono text-muted">{p.id}</td>
                      <td style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.name}
                      </td>
                      <td>{p.type.replace(/_/g, " ")}</td>
                      <td>{p.region}</td>
                      <td className="mono">₹{p.budget_cr.toLocaleString()}</td>
                      <td className="mono">{p.duration_months}m</td>
                      <td className="mono">
                        {pred
                          ? <span style={{ color: pred.cost_overrun_pct > 20 ? "var(--danger)" : "var(--accent2)" }}>
                              {pred.cost_overrun_pct}%
                            </span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td className="mono">
                        {pred
                          ? <span style={{ color: pred.delay_days > 60 ? "var(--danger)" : "var(--text)" }}>
                              {pred.delay_days}d
                            </span>
                          : <span className="text-muted">—</span>}
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handlePredict(p.id)}
                            disabled={busy}
                          >
                            {busy ? "…" : "Predict"}
                          </button>
                          <Link to={`/projects/${p.id}/edit`} className="btn btn-secondary btn-sm">
                            Edit
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(p.id)}
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
