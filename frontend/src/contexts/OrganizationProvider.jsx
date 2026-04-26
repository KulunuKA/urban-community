import React, { createContext, useContext, useState } from "react";
import { ROUTES } from "@/constants/routes";
import { organizationService } from "@/services/organization.service";
import { setSession } from "@/utils/session";
import { Navigate } from "react-router-dom";

const OrganizationContext = createContext();

export function OrganizationProvider({ children }) {
  const [organization, setOrganization] = useState(null);

  const register = async (formData) => {
    try {
      const res = await organizationService.register(formData);

      const data = res.data.data;
      if (res.status === 201) {
        setSession("accessToken", data.token);
        setSession("user", JSON.stringify(data.user));
        Navigate(ROUTES.ORGANIZATION_DASHBOARD);
      }
      return res.data;
    } catch (error) {
      throw (
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  };

  const getProfile = async () => {
    try {
      const res = await organizationService.profile();
      if (res.status === 200) {
        setOrganization(res.data.data);
      }
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch organization profile"
      );
    }
  };

  const updateProfile = async (formData) => {
    try {
      const res = await organizationService.updateProfile(formData);
      if (res.status === 200) {
        setOrganization(res.data.data);
      }
      return res.data;
    } catch (error) {
      throw (
        error.response?.data?.message ||
        error.message ||
        "Failed to update organization profile"
      );
    }
  };

  return (
    <OrganizationContext.Provider
      value={{ register, getProfile, updateProfile, organization }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error(
      "useOrganization must be used within a OrganizationProvider",
    );
  }
  return context;
};
