import { Routes, Route } from "react-router-dom";
import Navbar     from "./components/Navbar";
import Dashboard  from "./pages/Dashboard";
import Projects   from "./pages/Projects";
import Predict    from "./pages/Predict";
import Hotspots   from "./pages/Hotspots";
import Upload     from "./pages/Upload";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/projects" element={<Projects />}  />
        <Route path="/predict"  element={<Predict />}   />
        <Route path="/hotspots" element={<Hotspots />}  />
        <Route path="/upload"   element={<Upload />}    />
      </Routes>
    </>
  );
}
