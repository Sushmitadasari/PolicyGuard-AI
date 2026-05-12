import React from "react";
import Sidebar from "../components/common/Sidebar";
import TopNavbar from "../components/common/TopNavbar";

function DashboardLayout({
  children,
}) {
  return (
    <div className="flex min-h-screen bg-[#020617] text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />

        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;