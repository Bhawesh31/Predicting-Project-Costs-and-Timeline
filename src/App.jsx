import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Dashboard   from "./pages/Dashboard";
import Projects    from "./pages/Projects";
import ProjectForm from "./pages/ProjectForm";
import Hotspots    from "./pages/Hotspots";
import Upload      from "./pages/Upload";

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <nav className="sidebar">
          <div className="logo">⚡ POWERGRID</div>
          <NavLink to="/"          end>Dashboard</NavLink>
          <NavLink to="/projects"      >Projects</NavLink>
          <NavLink to="/projects/new"  >+ New Project</NavLink>
          <NavLink to="/hotspots"      >Hotspots</NavLink>
          <NavLink to="/upload"        >Upload Data</NavLink>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/"                  element={<Dashboard />} />
            <Route path="/projects"          element={<Projects />} />
            <Route path="/projects/new"      element={<ProjectForm />} />
            <Route path="/projects/:id/edit" element={<ProjectForm />} />
            <Route path="/hotspots"          element={<Hotspots />} />
            <Route path="/upload"            element={<Upload />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
