import SideBar from "@/pages/organization/SideBar";
import React from "react";
import { Outlet } from "react-router-dom";

export default function OrganizationLayout() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <SideBar />

      <main
        className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8"
      >
        <Outlet />
      </main>
    </div>
  );
}
