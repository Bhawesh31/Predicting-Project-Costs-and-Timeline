import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Projects.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchProjects = () => {
    setLoading(true);
    axios.get("/api/projects")
      .then((res) => setProjects(res.data))
      .catch(() => setError("Could not load projects."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await axios.delete(`/api/projects/${id}`);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Failed to delete project.");
    }
  };

  return (
    <div>
      <div className="projects-header">
        <h1 className="page-title">Projects</h1>
        <Link to="/add" className="btn btn-primary">+ Add Project</Link>
      </div>

      {error   && <p className="error-msg">{error}</p>}
      {loading && <p className="muted">Loading…</p>}

      {!loading && !error && (
        projects.length === 0 ? (
          <div className="card empty-state">
            <p>No projects yet. <Link to="/add">Add one</Link> or <Link to="/upload">upload a file</Link>.</p>
          </div>
        ) : (
          <div className="card">
            <table className="data-table">
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
                    <td>{p.id}</td>
                    <td>
                      <Link to={`/projects/${p.id}`} className="project-link">{p.name}</Link>
                    </td>
                    <td>{p.type}</td>
                    <td>{p.region}</td>
                    <td>₹{p.budget_cr.toLocaleString()}</td>
                    <td>{p.duration_months} mo</td>
                    <td className="actions-cell">
                      <Link to={`/projects/${p.id}`} className="btn btn-outline">View</Link>
                      <button className="btn btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
