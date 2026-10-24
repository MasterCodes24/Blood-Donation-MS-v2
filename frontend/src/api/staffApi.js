import api from "./axios";

export const staffApi = {
  register: (payload) => api.post("/staff/register", payload),
  login: (payload) => api.post("/staff/login", payload),
  appointments: () => api.get("/staff/appointments"),
  approve: (id) => api.patch(`/staff/appointments/${id}/approve`),
  reject: (id) => api.patch(`/staff/appointments/${id}/reject`),
  complete: (id) => api.patch(`/staff/appointments/${id}/complete`),
};
