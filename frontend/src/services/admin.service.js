import axiosInstance from "./axiosInstance";
import { getSessionValue } from "@/utils/session";

const ADMIN_URL = "/api/admin";
const RECYCLING_URL = "/api/recycling";
const ISSUES_URL = "/api/issues";

const getAdminHeaders = () => ({
  Authorization: `Bearer ${getSessionValue("accessToken")}`,
});

export const adminService = {
  // Auth
  login: async (email, password) => {
    return await axiosInstance.post(`${ADMIN_URL}/login`, { email, password });
  },

  register: async (data) => {
    return await axiosInstance.post(`${ADMIN_URL}/register`, data);
  },

  // Recycling Centers (admin)
  createCenter: async (data) => {
    return await axiosInstance.post(`${RECYCLING_URL}/centers`, data, {
      headers: getAdminHeaders(),
    });
  },

  updateCenter: async (id, data) => {
    return await axiosInstance.put(`${RECYCLING_URL}/centers/${id}`, data, {
      headers: getAdminHeaders(),
    });
  },

  deleteCenter: async (id) => {
    return await axiosInstance.delete(`${RECYCLING_URL}/centers/${id}`, {
      headers: getAdminHeaders(),
    });
  },

  // Pickup Requests (admin)
  getAllPickupRequests: async () => {
    return await axiosInstance.get(`${RECYCLING_URL}/pickups`, {
      headers: getAdminHeaders(),
    });
  },

  updatePickupStatus: async (id, status) => {
    return await axiosInstance.put(
      `${RECYCLING_URL}/pickups/${id}/status`,
      { status },
      { headers: getAdminHeaders() },
    );
  },

  // Recycling Centers (public read)
  getAllCenters: async () => {
    return await axiosInstance.get(`${RECYCLING_URL}/centers`);
  },

  /**
   * Civic issues (admin) — GET /api/issues
   * @param {{ page?: number, limit?: number, status?: string, category?: string, search?: string }} params
   */
  getIssues: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );
    return await axiosInstance.get(ISSUES_URL, {
      headers: getAdminHeaders(),
      params: clean,
    });
  },

  /** GET /api/issues/analytics/summary — counts by status & category */
  getIssueAnalytics: async () => {
    return await axiosInstance.get(`${ISSUES_URL}/analytics/summary`, {
      headers: getAdminHeaders(),
    });
  },

  updateIssueStatus: async (issueId, status) => {
    return await axiosInstance.patch(
      `${ISSUES_URL}/${issueId}/status`,
      { status },
      { headers: getAdminHeaders() },
    );
  },

  /** Single issue for admin (GET /api/issues/admin/:id) */
  getIssueByIdAdmin: async (issueId) => {
    return await axiosInstance.get(`${ISSUES_URL}/admin/${issueId}`, {
      headers: getAdminHeaders(),
    });
  },

  /** PATCH /api/issues/:id/admin-response */
  addAdminResponse: async (issueId, adminResponse) => {
    return await axiosInstance.patch(
      `${ISSUES_URL}/${issueId}/admin-response`,
      { adminResponse },
      { headers: getAdminHeaders() },
    );
  },

  /**
   * User management — GET /api/admin/users/civilians
   * @param {{ page?: number, limit?: number, search?: string }} params
   */
  getCivilians: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );
    return await axiosInstance.get(`${ADMIN_URL}/users/civilians`, {
      headers: getAdminHeaders(),
      params: clean,
    });
  },

  /**
   * User management — GET /api/admin/users/organizations
   * @param {{ page?: number, limit?: number, search?: string }} params
   */
  getOrganizations: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );
    return await axiosInstance.get(`${ADMIN_URL}/users/organizations`, {
      headers: getAdminHeaders(),
      params: clean,
    });
  },

  /**
   * Events (admin) — GET /api/admin/events
   * @param {{ page?: number, limit?: number, search?: string }} params
   */
  getEvents: async (params = {}) => {
    const clean = Object.fromEntries(
      Object.entries(params).filter(
        ([, v]) => v !== undefined && v !== null && v !== "",
      ),
    );
    return await axiosInstance.get(`${ADMIN_URL}/events`, {
      headers: getAdminHeaders(),
      params: clean,
    });
  },

  /** GET /api/admin/events/:id — populated organization */
  getEventByIdAdmin: async (eventId) => {
    return await axiosInstance.get(`${ADMIN_URL}/events/${eventId}`, {
      headers: getAdminHeaders(),
    });
  },
};
