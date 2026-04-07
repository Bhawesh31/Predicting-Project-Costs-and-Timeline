import { useState } from "react";
import { uploadFile } from "../api";

const REQUIRED_COLS = [
  "name", "type", "region", "budget_cr", "terrain_score",
  "duration_months", "vendor_perf_score", "weather_risk_score", "permit_delay_days",
];

export default function Upload() {
  const [file,    setFile]    = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  function handleFileChange(e) {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setResult(null);
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await uploadFile(fd);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="page-title">Upload Project Data</h1>

      <div className="grid-2" style={{ gap: "1.5rem", alignItems: "start" }}>
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="form-group mb-2">
              <label>CSV or Excel file</label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                style={{ padding: "0.4rem 0.75rem" }}
              />
            </div>

            {error  && <div className="alert alert-error   mb-2">{error}</div>}
            {result && (
              <div className="alert alert-success mb-2">
                {result.message}
                {result.errors?.length > 0 && (
                  <ul style={{ marginTop: "0.5rem", paddingLeft: "1rem" }}>
                    {result.errors.map((e, i) => <li key={i} style={{ fontSize: "0.8rem" }}>{e}</li>)}
                  </ul>
                )}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={!file || loading}
            >
              {loading ? "Uploading…" : "Upload"}
            </button>
          </form>
        </div>

        <div className="card">
          <div style={{ fontWeight: 600, marginBottom: "0.75rem" }}>Required Columns</div>
          <table>
            <thead>
              <tr>
                <th>Column</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="mono">name</td>              <td>Project name (text)</td></tr>
              <tr><td className="mono">type</td>              <td>substation / overhead_line / underground_cable</td></tr>
              <tr><td className="mono">region</td>            <td>north / south / east / west</td></tr>
              <tr><td className="mono">budget_cr</td>         <td>Budget in Crore INR (number)</td></tr>
              <tr><td className="mono">terrain_score</td>     <td>0.0 (flat) → 1.0 (very difficult)</td></tr>
              <tr><td className="mono">duration_months</td>   <td>Planned duration in months</td></tr>
              <tr><td className="mono">vendor_perf_score</td> <td>0.0 (poor) → 1.0 (excellent)</td></tr>
              <tr><td className="mono">weather_risk_score</td><td>0.0 (safe) → 1.0 (high risk)</td></tr>
              <tr><td className="mono">permit_delay_days</td> <td>Expected permit delay in days</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
