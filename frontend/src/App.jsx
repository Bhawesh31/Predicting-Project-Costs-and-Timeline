import React from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import AddProject from "./pages/AddProject";
import Upload from "./pages/Upload";
import ProjectDetail from "./pages/ProjectDetail";
import "./App.css";

function Navbar() {
  return (
    <nav className="navbar">
      <span className="navbar-brand">⚡ POWERGRID Intelligence</span>
      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Dashboard</NavLink>
        <NavLink to="/projects" className={({ isActive }) => isActive ? "active" : ""}>Projects</NavLink>
        <NavLink to="/add" className={({ isActive }) => isActive ? "active" : ""}>Add Project</NavLink>
        <NavLink to="/upload" className={({ isActive }) => isActive ? "active" : ""}>Upload</NavLink>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route path="/add" element={<AddProject />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
