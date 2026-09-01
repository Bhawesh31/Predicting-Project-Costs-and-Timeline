export default function HotspotsList({ hotspots }) {
  const items = Array.isArray(hotspots) ? hotspots : []

  if (items.length === 0) {
    return (
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Risk Hotspots</h3>
        <p style={{ color: '#86efac' }}>✓ No high-risk projects detected</p>
      </div>
    )
  }

  return (
    <div className="card" style={{ marginTop: '2rem' }}>
      <h3>⚠️ Risk Hotspots</h3>
      <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
        {items.length} project(s) with potential risks
      </p>
      
      <div className="grid">
        {items.map((hotspot, idx) => (
          <div key={idx} style={{
            background: '#7f1d1d',
            border: '1px solid #fca5a5',
            borderRadius: '0.375rem',
            padding: '1rem'
          }}>
            <h4 style={{ color: '#fca5a5', marginBottom: '0.5rem' }}>
              {hotspot.project_name}
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>
              <strong>Risk Score:</strong> {(hotspot.risk_score * 100).toFixed(1)}%
            </p>
            <p style={{ fontSize: '0.875rem', color: '#fca5a5' }}>
              <strong>Risk Factors:</strong>
            </p>
            <ul style={{ fontSize: '0.875rem', color: '#cbd5e1', marginLeft: '1rem' }}>
              {(hotspot.top_factors || hotspot.risk_factors || []).map((factor, i) => (
                <li key={i}>{factor}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
