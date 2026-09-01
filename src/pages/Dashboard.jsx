import { useState, useEffect } from 'react'
import { endpoints } from '../api'
import HotspotsList from '../components/HotspotsList'

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, avg_cost: 0, avg_timeline: 0 })
  const [hotspots, setHotspots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      const [projectsRes, hotspotsRes] = await Promise.all([
        endpoints.listProjects(),
        endpoints.getHotspots()
      ])
      
      const projects = projectsRes.data
      setStats({
        total: projects.length,
        avg_cost: projects.length > 0 
          ? (projects.reduce((sum, p) => sum + p.budget_cr, 0) / projects.length).toFixed(2)
          : 0,
        avg_timeline: projects.length > 0
          ? (projects.reduce((sum, p) => sum + p.duration_months, 0) / projects.length).toFixed(1)
          : 0
      })
      setHotspots(hotspotsRes.data.hotspots || [])
      setError(null)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Dashboard Overview</h2>
      
      <div className="stats">
        <div className="stat-box">
          <h4>Total Projects</h4>
          <div className="value">{stats.total}</div>
        </div>
        <div className="stat-box">
          <h4>Avg Budget (Cr)</h4>
          <div className="value">₹{stats.avg_cost}</div>
        </div>
        <div className="stat-box">
          <h4>Avg Timeline (Months)</h4>
          <div className="value">{stats.avg_timeline}</div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}
      
      <button onClick={loadDashboard} style={{ marginBottom: '1rem' }}>
        Refresh Dashboard
      </button>

      <HotspotsList hotspots={hotspots} />
    </div>
  )
}
