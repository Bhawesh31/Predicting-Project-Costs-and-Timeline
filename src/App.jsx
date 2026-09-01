import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { endpoints } from './api'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Predictions from './pages/Predictions'

function Header() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path ? 'active' : ''

  return (
    <div className="header">
      <div className="container">
        <h1>⚡ POWERGRID Intelligence</h1>
        <p>Predictive System for Project Costs & Timeline Estimation</p>
        <nav className="nav">
          <Link to="/" className={`${isActive('/')}`}>Dashboard</Link>
          <Link to="/projects" className={`${isActive('/projects')}`}>Projects</Link>
          <Link to="/predictions" className={`${isActive('/predictions')}`}>Predictions</Link>
        </nav>
      </div>
    </div>
  )
}

export default function App() {
  const [apiStatus, setApiStatus] = useState(null)

  useEffect(() => {
    endpoints.health()
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'))
  }, [])

  return (
    <BrowserRouter>
      <Header />
      <div className="container">
        {apiStatus === 'disconnected' && (
          <div style={{ 
            color: '#fca5a5', 
            padding: '1rem', 
            background: '#7f1d1d', 
            borderRadius: '0.375rem',
            marginBottom: '1rem'
          }}>
            ⚠️ Backend API is not responding. Make sure the FastAPI server is running on http://localhost:8000
          </div>
        )}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/predictions" element={<Predictions />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
