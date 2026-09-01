import { useState, useEffect } from 'react'
import { endpoints } from '../api'
import ProjectForm from '../components/ProjectForm'

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await endpoints.listProjects()
      setProjects(res.data)
      setError(null)
    } catch (err) {
      setError('Failed to load projects')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await endpoints.deleteProject(id)
        setProjects(projects.filter(p => p.id !== id))
      } catch (err) {
        setError('Failed to delete project')
      }
    }
  }

  const handleFormSubmit = async (data) => {
    try {
      if (editingId) {
        await endpoints.updateProject(editingId, data)
      } else {
        await endpoints.createProject(data)
      }
      await loadProjects()
      setShowForm(false)
      setEditingId(null)
    } catch (err) {
      setError('Failed to save project')
      console.error(err)
    }
  }

  const startEdit = (project) => {
    setEditingId(project.id)
    setShowForm(true)
  }

  if (loading) return <div className="loading"><div className="spinner"></div></div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Projects</h2>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null) }}>
          {showForm ? 'Cancel' : '+ New Project'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <ProjectForm 
          onSubmit={handleFormSubmit}
          projectId={editingId}
          onCancel={() => { setShowForm(false); setEditingId(null) }}
        />
      )}

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>No projects yet. Create one to get started!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Region</th>
                <th>Budget (Cr)</th>
                <th>Duration (Months)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.type}</td>
                  <td>{p.region}</td>
                  <td>₹{p.budget_cr}</td>
                  <td>{p.duration_months}</td>
                  <td>
                    <button onClick={() => startEdit(p)}>Edit</button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: '#dc2626' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
