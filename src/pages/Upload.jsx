import { useState, useRef } from "react";
import { uploadFile } from "../api";

export default function Upload() {
  const [file,    setFile]    = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");
  const inputRef = useRef();

  const handleFile = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null); setErr("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) { setFile(dropped); setResult(null); setErr(""); }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true); setErr(""); setResult(null);
    try {
      const res = await uploadFile(file);
      setResult(res.data);
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (ex) {
      setErr(ex.response?.data?.detail || ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">Bulk Upload Projects</h1>

      <div className="card" style={{ maxWidth: "560px" }}>
        <p style={{ color: "var(--muted)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
          Upload a <strong>.csv</strong> or <strong>.xlsx</strong> file containing project rows.
          Required columns:&nbsp;
          <code style={{ fontSize: "0.8rem", color: "var(--accent)" }}>
            name, type, region, budget_cr, terrain_score, duration_months, vendor_perf_score, weather_risk_score, permit_delay_days
          </code>
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: "2px dashed var(--border)",
            borderRadius: "var(--radius)",
            padding: "2rem",
            textAlign: "center",
            cursor: "pointer",
            marginBottom: "1rem",
            transition: "border-color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          {file ? (
            <span style={{ color: "var(--accent2)" }}>📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
          ) : (
            <span style={{ color: "var(--muted)" }}>Drop file here or click to select</span>
          )}
        </div>

        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile}
          style={{ display: "none" }} />

        <button className="btn-primary" onClick={handleSubmit} disabled={!file || loading}>
          {loading ? "Uploading…" : "Upload & Import"}
        </button>

        {err && <p className="error-msg" style={{ marginTop: "0.75rem" }}>{err}</p>}
      </div>

      {result && (
        <div className="card" style={{ marginTop: "1.5rem", maxWidth: "560px" }}>
          <h3 style={{ marginBottom: "0.75rem" }}>Import Result</h3>
          <p className="success-msg">{result.message}</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Rows in file: {result.total_rows} · Created: {result.created}
          </p>
          {result.errors?.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              <p style={{ color: "var(--warn)", fontSize: "0.85rem", marginBottom: "0.4rem" }}>Skipped rows:</p>
              <ul style={{ paddingLeft: "1.25rem", fontSize: "0.8rem", color: "var(--muted)" }}>
                {result.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
