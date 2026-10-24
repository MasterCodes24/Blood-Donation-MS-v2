import api from "./axios";

export const donorApi = {
  register: (payload) => api.post("/donors/register", payload),
  login: (payload) => api.post("/donors/login", payload),
  me: () => api.get("/donors/me"),
  update: (payload) => api.put("/donors/me", payload),
  bookAppointment: (payload) => api.post("/appointments", payload),
  appointments: () => api.get("/appointments/me"),
  donations: () => api.get("/donations/me"),
};
