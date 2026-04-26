import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/contexts/AuthProvider";
import { getSessionValue } from "@/utils/session";

const getUserRole = () => {
  try {
    const rawUser = getSessionValue("user");
    if (!rawUser) return null;
    const parsedUser = JSON.parse(rawUser);
    return parsedUser?.role || null;
  } catch {
    return null;
  }
};

const getFallbackRouteByRole = (role) => {
  if (role === "organization") return ROUTES.ORGANIZATION_DASHBOARD;
  if (role === "citizen") return ROUTES.DASHBOARD;
  return ROUTES.HOME;
};

export function ProtectedRoute({ role }) {
  const { isAuthenticated, isAuthReady } = useAuth();
  const userRole = getUserRole();

  if (!isAuthReady) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  if (role && userRole && userRole !== role) {
    return <Navigate to={getFallbackRouteByRole(userRole)} replace />;
  }
  return <Outlet />;
}
