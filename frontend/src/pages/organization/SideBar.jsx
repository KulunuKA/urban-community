import React from "react";
import { Bell, Earth, LayoutDashboard, List, Mail, Recycle, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      label: "Event Dashboard",
      path: "/organization/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "My Events",
      path: "/organization/events",
      icon: <List size={20} />,
    },
    {
      label: "Explore Events",
      path: "/organization/explore", // This now matches the AppRouter exactly
      icon: <Earth size={20} />,
    },
    { label: "Requests", path: ROUTES.ORGANIZATION_REQUESTS, icon: <Mail /> },
    {
      label: "Notifications",
      path: ROUTES.ORGANIZATION_NOTIFICATIONS,
      icon: <Bell size={20} />,
    },
    {
      label: "Profile",
      path: "/organization/profile",
      icon: <User size={20} />,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950 text-white font-sans">
      <aside className="w-64 border-r border-white/10 bg-slate-900/50 backdrop-blur-xl p-6 hidden md:block">
        <div
          className="mb-10 flex items-center gap-3 group cursor-pointer"
          onClick={() => navigate("/")}
        >
          <Recycle size={32} strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight">Urban</span>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                type="button"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-inner"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
                onClick={() => navigate(item.path)}
              >
                <span
                  className={`transition-colors ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-white"}`}
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-10 left-6 right-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
              Status
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-slate-300 font-medium">
                Server Online
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
