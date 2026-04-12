import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import { ROUTES } from "../constants/routes";

export function PublicRoute() {
  const { isAuthenticated, isAuthReady } = useAuth();
  console.log("isAuthenticated:", isAuthenticated);
  console.log("isAuthReady:", isAuthReady);


  if (!isAuthReady) {
    return null;
  }
  if (isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }
  return <Outlet />;
}
