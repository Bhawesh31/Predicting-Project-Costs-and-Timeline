import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import ProjectForm from "../components/ProjectForm";
import "./ProjectDetail.css";

export default function ProjectDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const [project, setProject]     = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [editing, setEditing]     = useState(false);
  const [loading, setLoading]     = useState(true);
  const [predLoading, setPredLoading] = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    axios.get(`/api/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch(() => setError("Project not found."))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePredict = async () => {
    setPredLoading(true);
    try {
      const res = await axios.get(`/api/predict/${id}`);
      setPrediction(res.data);
    } catch (e) {
      alert("Prediction failed: " + (e.response?.data?.detail || e.message));
    } finally {
      setPredLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this project?")) return;
    await axios.delete(`/api/projects/${id}`);
    navigate("/projects");
  };

  const handleUpdate = async (data) => {
    const res = await axios.put(`/api/projects/${id}`, data);
    setProject(res.data);
    setEditing(false);
  };

  if (loading) return <p className="muted">Loading…</p>;
  if (error)   return <p className="error-msg">{error}</p>;

  return (
    <div>
      <div className="detail-header">
        <div>
          <Link to="/projects" className="back-link">← Projects</Link>
          <h1 className="page-title">{project.name}</h1>
        </div>
        <div className="detail-actions">
          <button className="btn btn-outline" onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
          <button className="btn btn-success" onClick={handlePredict} disabled={predLoading}>
            {predLoading ? "Predicting…" : "Run Prediction"}
          </button>
        </div>
      </div>

      {editing ? (
        <div className="card">
          <ProjectForm initialData={project} onSubmit={handleUpdate} submitLabel="Save Changes" />
        </div>
      ) : (
        <div className="detail-grid">
          <div className="card">
            <h2 className="section-title">Project Details</h2>
            <dl className="detail-list">
              <dt>ID</dt>         <dd>{project.id}</dd>
              <dt>Type</dt>       <dd>{project.type}</dd>
              <dt>Region</dt>     <dd>{project.region}</dd>
              <dt>Budget</dt>     <dd>₹{project.budget_cr.toLocaleString()} Cr</dd>
              <dt>Duration</dt>   <dd>{project.duration_months} months</dd>
              <dt>Terrain Score</dt>      <dd>{project.terrain_score}</dd>
              <dt>Vendor Perf.</dt>       <dd>{project.vendor_perf_score}</dd>
              <dt>Weather Risk</dt>       <dd>{project.weather_risk_score}</dd>
              <dt>Permit Delay</dt>       <dd>{project.permit_delay_days} days</dd>
            </dl>
          </div>

          {prediction && (
            <div className="card prediction-card">
              <h2 className="section-title">Prediction Results</h2>
              <div className="pred-row">
                <span className="pred-label">Cost Overrun</span>
                <span className="pred-value">{prediction.cost_overrun_pct}%</span>
              </div>
              <div className="pred-row">
                <span className="pred-label">Expected Delay</span>
                <span className="pred-value">{prediction.delay_days} days</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
