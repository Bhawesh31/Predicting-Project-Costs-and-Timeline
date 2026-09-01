import { useState, useEffect } from 'react'
import { endpoints } from '../api'

export default function Predictions() {
  const [projects, setProjects] = useState([])
  const [predictions, setPredictions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [trainLoading, setTrainLoading] = useState(false)

  useEffect(() => {
    loadPredictions()
  }, [])

  const loadPredictions = async () => {
    setLoading(true)
    try {
      const res = await endpoints.listProjects()
      setProjects(res.data)
      
      const preds = {}
      for (const project of res.data) {
        try {
          const predRes = await endpoints.predict(project.id)
          preds[project.id] = predRes.data
        } catch (err) {
          preds[project.id] = { error: 'Failed to predict' }
        }
      }
      setPredictions(preds)
      setError(null)
    } catch (err) {
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleTrain = async () => {
    setTrainLoading(true)
    try {
      const res = await endpoints.trainModel()
      alert(`Model trained: ${res.data.message}`)
      await loadPredictions()
    } catch (err) {
      alert(`Training failed: ${err.response?.data?.detail || err.message}`)
    } finally {
      setTrainLoading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Predictions</h2>
        <button onClick={handleTrain} disabled={trainLoading || projects.length < 5}>
          {trainLoading ? 'Training...' : 'Train Model'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
      
      {projects.length < 5 && (
        <div className="badge-warning" style={{ 
          padding: '1rem', 
          background: '#78350f',
          borderRadius: '0.375rem',
          marginBottom: '1rem'
        }}>
          ℹ️ Add at least 5 projects to train the ML model (currently have {projects.length})
        </div>
      )}

      <div className="grid grid-2">
        {projects.map(project => {
          const pred = predictions[project.id]
          return (
            <div key={project.id} className="card">
              <h3>{project.name}</h3>
              <p><strong>Type:</strong> {project.type}</p>
              <p><strong>Region:</strong> {project.region}</p>
              <p><strong>Budget:</strong> ₹{project.budget_cr} Cr</p>
              <p><strong>Duration:</strong> {project.duration_months} months</p>
              
              {pred && !pred.error ? (
                <div style={{ marginTop: '1rem', borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                  <h4 style={{ color: '#60a5fa', marginBottom: '0.5rem' }}>Predictions</h4>
                  <p><strong>Cost Overrun:</strong> <span className="badge badge-warning">{pred.cost_overrun_pct}%</span></p>
                  <p><strong>Delay:</strong> <span className="badge badge-info">{pred.delay_days} days</span></p>
                </div>
              ) : (
                <div style={{ marginTop: '1rem', color: '#fca5a5' }}>
                  {pred?.error || 'Loading...'}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {projects.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No projects available. Create some projects first!</p>
        </div>
      )}
    </div>
  )
}
