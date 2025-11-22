import React from "react";
import { Outlet } from "react-router-dom";
import PatientSidebar from "./PatientSidebar";
import GreetingHeader from "./GreetingHeader"; // <-- NEW IMPORT

const PatientLayout: React.FC = () => {
  return (
    // Add relative to ensure sticky works within the flow
    <div className="min-h-screen bg-background relative">
      {/* Your PatientSidebar will be fixed on the right */}
      <PatientSidebar />

      {/* The main content area where patient pages will render */}
      {/* The `pr-16` padding prevents content from hiding behind the fixed sidebar */}
      <main className="pr-16">
        {/* The Greeting Header is placed at the top */}
        <GreetingHeader />
        {/* The Outlet content will now have an inner div to manage spacing and prevent the header from taking up space twice */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PatientLayout;
