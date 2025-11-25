// src/components/layout/PatientLayout.tsx

import React from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "./PatientSidebar";

interface PatientLayoutProps {
  children?: React.ReactNode; // ⭐ ADD THIS
}

const PatientLayout: React.FC<PatientLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background relative">
      <PatientSidebar />

      <main className="pr-16">
        <div className="p-6">
          {children}
          <Outlet /> {/* ⭐ This ensures router pages render */}
        </div>
      </main>
    </div>
  );
};

export default PatientLayout;
