import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { ROUTES } from "../constants/routes";
import { getSessionValue } from "@/utils/session";

export function PublicRoute() {
  const { isAuthenticated, isAuthReady } = useAuth();
  const user = getSessionValue("user") || getSessionValue("adminUser");

  if (isAuthenticated && user) {
    const parsedUser = JSON.parse(user);
    if (parsedUser.role === "citizen") {
      return <Navigate to={ROUTES.DASHBOARD} replace />;
    } else if (parsedUser.role === "organization") {
      return <Navigate to={ROUTES.ORGANIZATION_DASHBOARD} replace />;
    } else if (parsedUser.role === "admin") {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    }
  }

  if (!isAuthReady) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <Outlet />;
}
