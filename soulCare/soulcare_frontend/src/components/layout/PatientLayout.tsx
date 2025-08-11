import React from 'react';
import { Outlet } from 'react-router-dom';
import PatientSidebar from './PatientSidebar'; // Your new sidebar component

const PatientLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Your PatientSidebar will be fixed on the right */}
      <PatientSidebar />
      
      {/* The main content area where patient pages will render */}
      {/* The `pr-16` padding prevents content from hiding behind the fixed sidebar */}
      <main className="pr-16">
        {/* The <Outlet> is a placeholder that react-router will fill with the
            correct page component (e.g., PatientDashboard, MoodTracker, etc.) */}
        <Outlet />
      </main>
    </div>
  );
};

export default PatientLayout;