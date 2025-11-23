import React from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex">
      <AdminSidebar />
      {/* The main content area for admin pages */}
      <main className="flex-1 pl-64 overflow-y-auto">
        {" "}
        {/* pl-64 to offset the width of the sidebar */}
        {/* The Greeting Header is placed at the top of the main area, sticky */}
        {/* The content below the header */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
