import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProjectForm from "../components/ProjectForm";

export default function AddProject() {
  const navigate    = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (data) => {
    setError(null);
    try {
      const res = await axios.post("/api/projects", data);
      navigate(`/projects/${res.data.id}`);
    } catch (e) {
      setError(e.response?.data?.detail || "Failed to create project.");
    }
  };

  return (
    <div>
      <h1 className="page-title">Add Project</h1>
      {error && <p style={{ color: "#f87171", marginBottom: "1rem" }}>{error}</p>}
      <div className="card">
        <ProjectForm onSubmit={handleSubmit} submitLabel="Create Project" />
      </div>
    </div>
  );
}
