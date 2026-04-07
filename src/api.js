import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getProjects    = ()       => api.get("/projects");
export const getProject     = (id)     => api.get(`/projects/${id}`);
export const createProject  = (data)   => api.post("/projects", data);
export const updateProject  = (id, data) => api.put(`/projects/${id}`, data);
export const deleteProject  = (id)     => api.delete(`/projects/${id}`);
export const predict        = (id)     => api.get(`/predict/${id}`);
export const getHotspots    = ()       => api.get("/hotspots");
export const trainModels    = ()       => api.post("/train");
export const uploadFile     = (formData) =>
  api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });

export default api;
