import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import { useId, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Building2,
  Truck,
  LogOut,
  Users,
  CalendarDays,
  ClipboardList,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { removeSession } from "@/utils/session";
import { ROUTES } from "@/constants/routes";

const ADMIN_NAV = [
  {
    label: "Dashboard",
    to: ROUTES.ADMIN_DASHBOARD,
    end: true,
    icon: LayoutDashboard,
  },
  {
    label: "User Management",
    to: ROUTES.ADMIN_USER_MANAGEMENT,
    end: false,
    icon: Users,
  },
  {
    label: "Event Management",
    to: ROUTES.ADMIN_EVENT_MANAGEMENT,
    end: false,
    icon: CalendarDays,
  },
  {
    label: "Recycling Centers",
    to: ROUTES.ADMIN_RECYCLING_CENTERS,
    end: false,
    icon: Building2,
  },
  {
    label: "Pickup Requests",
    to: ROUTES.ADMIN_PICKUP_REQUESTS,
    end: false,
    icon: Truck,
  },
  {
    label: "Issue Management",
    to: ROUTES.ADMIN_ISSUE_MANAGEMENT,
    end: false,
    icon: ClipboardList,
  },
];

function sidebarLinkClass({ isActive }) {
  return [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
    isActive
      ? "bg-indigo-500/15 text-indigo-300 shadow-inner shadow-indigo-500/10"
      : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
  ].join(" ");
}

export default function AdminDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const menuId = useId();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await removeSession("accessToken");
    await removeSession("adminUser");
    setMobileOpen(false);
    navigate("/admin/login");
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-slate-950 text-slate-200">
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden>
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: [
              "radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent 42%)",
              "radial-gradient(circle at bottom left, rgba(139,92,246,0.08), transparent 38%)",
            ].join(","),
          }}
        />
      </div>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      <aside
        id={menuId}
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-screen max-h-screen flex-col overflow-hidden border-r border-white/5 bg-slate-900/95 backdrop-blur-xl transition-[width,transform] duration-200 ease-out",
          "max-w-[85vw] lg:max-w-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-[4.5rem]" : "w-64",
        ].join(" ")}
        aria-label="Admin navigation"
      >
        <div
          className={[
            "flex shrink-0 items-center gap-3 border-b border-white/5 px-4 py-5",
            collapsed ? "justify-center px-2" : "",
          ].join(" ")}
        >
          <Link
            to={ROUTES.ADMIN_DASHBOARD}
            className={[
              "flex min-w-0 items-center gap-3 text-left",
              collapsed ? "justify-center" : "",
            ].join(" ")}
            onClick={closeMobile}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-xl shadow-lg shadow-indigo-500/20">
              <ShieldCheck size={22} className="text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-base font-bold tracking-wide text-white">
                  Admin Panel
                </p>
                <p className="truncate text-xs text-slate-500">
                  Urban Community
                </p>
              </div>
            )}
          </Link>
        </div>

        <nav
          className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden px-3 py-4"
          aria-label="Admin sections"
        >
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={sidebarLinkClass}
              onClick={closeMobile}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="shrink-0" strokeWidth={2} aria-hidden />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div
          className={[
            "shrink-0 border-t border-white/5 p-3",
            collapsed ? "flex flex-col items-center gap-2" : "space-y-2",
          ].join(" ")}
        >
          <button
            type="button"
            className={[
              "hidden w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200 lg:flex",
              collapsed ? "px-2" : "",
            ].join(" ")}
            onClick={() => setCollapsed((c) => !c)}
            aria-expanded={!collapsed}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft size={18} aria-hidden />
            ) : (
              <>
                <PanelLeftClose size={18} aria-hidden />
                <span>Collapse</span>
              </>
            )}
          </button>
          <button
            type="button"
            className={[
              "flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300",
              collapsed ? "px-2" : "",
            ].join(" ")}
            onClick={handleLogout}
            title="Log out"
          >
            <LogOut size={18} aria-hidden />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      <div
        className={[
          "flex min-w-0 flex-1 flex-col transition-[margin] duration-200 ease-out",
          collapsed ? "lg:ml-[4.5rem]" : "lg:ml-64",
        ].join(" ")}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/5 bg-slate-900/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <button
            type="button"
            className="inline-flex rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="sr-only">Toggle navigation menu</span>
            <PanelLeft size={20} aria-hidden />
          </button>
          <p className="truncate text-sm font-semibold text-white">
            Urban Community — Admin
          </p>
          <button
            type="button"
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            onClick={handleLogout}
          >
            Out
          </button>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <Outlet />
        </main>

        <footer className="border-t border-white/5 py-6 text-center text-xs text-slate-600">
          © {new Date().getFullYear()} Urban Community — Admin Portal
        </footer>
      </div>
    </div>
  );
}
