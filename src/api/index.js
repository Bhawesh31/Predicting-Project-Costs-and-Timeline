import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// Projects
export const getProjects   = ()         => api.get("/projects");
export const getProject    = (id)       => api.get(`/projects/${id}`);
export const createProject = (data)     => api.post("/projects", data);
export const updateProject = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject = (id)       => api.delete(`/projects/${id}`);

// ML
export const predict   = (id)  => api.get(`/predict/${id}`);
export const hotspots  = ()    => api.get("/hotspots");
export const trainModels = ()  => api.post("/train");

// Upload
export const uploadFile = (file) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
};
