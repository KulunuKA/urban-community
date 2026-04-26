import { Navigate, Outlet } from "react-router-dom";
import { CivilianDashboardNavbar } from "@/features/civilian/components/CivilianDashboardNavbar";
import { Footer } from "@/features/home/components/Footer";
import { useAuth } from "@/contexts/AuthProvider";
import { ROUTES } from "@/constants/routes";

export function CivilianDashboardLayout() {
  const { isAuthenticated, isAuthReady } = useAuth();

  if (!isAuthReady) {
    return null;
  }
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return (
    <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-slate-50 text-slate-800">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: [
              "radial-gradient(circle at top right, color-mix(in oklch, var(--color-emerald-400) 22%, transparent), transparent 38%)",
              "radial-gradient(circle at bottom left, color-mix(in oklch, var(--color-sky-400) 18%, transparent), transparent 32%)",
            ].join(","),
          }}
        />
      </div>

      <CivilianDashboardNavbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
