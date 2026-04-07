import React, { useRef, useState } from "react";
import axios from "axios";
import "./Upload.css";

export default function Upload() {
  const inputRef       = useRef(null);
  const [result, setResult]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]     = useState(null);

  const handleUpload = async () => {
    const file = inputRef.current?.files?.[0];
    if (!file) { alert("Please select a file first."); return; }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const res = await axios.post("/api/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className="page-title">Upload Projects</h1>

      <div className="card upload-card">
        <p className="upload-hint">
          Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file with columns:
          <br />
          <code>name, type, region, budget_cr, terrain_score, duration_months, vendor_perf_score, weather_risk_score, permit_delay_days</code>
        </p>

        <div className="upload-row">
          <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="file-input" />
          <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>

        {error && <p className="upload-error">{error}</p>}

        {result && (
          <div className="upload-result">
            <p className="result-msg">✅ {result.message}</p>
            <p className="result-detail">Rows processed: {result.total_rows} | Created: {result.created}</p>
            {result.errors?.length > 0 && (
              <ul className="result-errors">
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
