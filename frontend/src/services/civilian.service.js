import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/api/civilian";

export const civilianService = {
  register: async (formData) => {
    return await axiosInstance.post(`${API_BASE_URL}/register`, {
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  },
  profile: async () => {
    return await axiosInstance.get(`${API_BASE_URL}/me`);
  },
  updateProfile: async (formData) => {
    return await axiosInstance.put(`${API_BASE_URL}/me`, formData);
  },
  getEvents: async () => {
    return await axiosInstance.get("/api/events");
  },
  sendEventRequest: async (eventId) => {
    return await axiosInstance.post(`/api/member/send-request`, { eventId });
  },
};
