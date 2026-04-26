import axiosInstance from "./axiosInstance";

const API_BASE_URL = "/api/organization";

export const organizationService = {
  register: async (formData) => {
    return await axiosInstance.post(`${API_BASE_URL}/register`, {
      name: formData.name,
      description: formData.description,
      address: formData.address,
      phone: formData.phone,
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
  getRequests: async () => {
    return await axiosInstance.get(`/api/member/requests`);
  },
  respondToRequest: async (requestId, status) => {
    return await axiosInstance.put(`/api/member/response-request/${requestId}`, {
      status,
    });
  },
};
