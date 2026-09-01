import { useState, useEffect } from 'react'
import { endpoints } from '../api'

export default function ProjectForm({ onSubmit, projectId, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'substation',
    region: 'north',
    budget_cr: '',
    terrain_score: '',
    duration_months: '',
    vendor_perf_score: '',
    weather_risk_score: '',
    permit_delay_days: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (projectId) {
      loadProject()
    }
  }, [projectId])

  const loadProject = async () => {
    try {
      const res = await endpoints.getProject(projectId)
      setFormData(res.data)
    } catch (err) {
      setError('Failed to load project')
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('score') || name.includes('delay') || name.includes('budget') || name.includes('duration')
        ? parseFloat(value) || ''
        : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await onSubmit(formData)
    } catch (err) {
      setError('Failed to save project')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3>{projectId ? 'Edit Project' : 'Add New Project'}</h3>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g., North Substation Phase 1"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select name="type" value={formData.type} onChange={handleChange} required>
              <option value="substation">Substation</option>
              <option value="overhead_line">Overhead Line</option>
              <option value="underground_cable">Underground Cable</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="region">Region *</label>
            <select name="region" value={formData.region} onChange={handleChange} required>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="budget_cr">Budget (Cr) *</label>
            <input
              id="budget_cr"
              name="budget_cr"
              type="number"
              step="0.01"
              value={formData.budget_cr}
              onChange={handleChange}
              required
              placeholder="50.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="duration_months">Duration (Months) *</label>
            <input
              id="duration_months"
              name="duration_months"
              type="number"
              value={formData.duration_months}
              onChange={handleChange}
              required
              placeholder="24"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="terrain_score">Terrain Score (0-1) *</label>
            <input
              id="terrain_score"
              name="terrain_score"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.terrain_score}
              onChange={handleChange}
              required
              placeholder="0.5"
            />
          </div>

          <div className="form-group">
            <label htmlFor="weather_risk_score">Weather Risk Score (0-1) *</label>
            <input
              id="weather_risk_score"
              name="weather_risk_score"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.weather_risk_score}
              onChange={handleChange}
              required
              placeholder="0.3"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="vendor_perf_score">Vendor Performance Score (0-1) *</label>
            <input
              id="vendor_perf_score"
              name="vendor_perf_score"
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formData.vendor_perf_score}
              onChange={handleChange}
              required
              placeholder="0.8"
            />
          </div>

          <div className="form-group">
            <label htmlFor="permit_delay_days">Permit Delay (Days) *</label>
            <input
              id="permit_delay_days"
              name="permit_delay_days"
              type="number"
              value={formData.permit_delay_days}
              onChange={handleChange}
              required
              placeholder="30"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (projectId ? 'Update Project' : 'Create Project')}
          </button>
          <button type="button" onClick={onCancel} style={{ background: '#6b7280' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
