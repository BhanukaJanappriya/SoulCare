import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

// This is our new, smarter ProtectedRoute component.
// It can now accept an optional `allowedRoles` prop.
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("--- PROTECTED ROUTE CHECK ---");
  console.log("Allowed Roles:", allowedRoles);
  console.log("Current User:", user);
  console.log("Is Loading:", isLoading);
  console.log("----------------------------");

  // 1. First, we wait for the AuthContext to finish loading its initial state.
  // This prevents the page from flickering to the login screen on a page refresh.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }

  // 2. If loading is done and there is NO user, they are not authenticated.
  // We send them to the login page.
  if (!user) {
    // We pass the page they were trying to visit so we can redirect them back after login.
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // 3. If a user exists AND this route requires specific roles...
  if (user && allowedRoles && allowedRoles.length > 0) {
    // ...we check if the user's role is in the list of allowed roles.
    const isAuthorized = allowedRoles.includes(user.role);

    // If they are NOT authorized...
    if (!isAuthorized) {
      // ...we must redirect them.
      // If a patient ('user' role) tries to access a doctor/counselor page,
      // we send them to their own dedicated dashboard.
      if (user.role === 'user') {
        return <Navigate to="/" replace />;
      }
      
      // For any other unauthorized user (e.g., a counselor trying to access a doctor-only page),
      // we send them back to their main dashboard as a safe fallback.
      return <Navigate to="/dashboard" replace />;
    }
  }

  // 4. If all checks pass, the user is authenticated and authorized.
  // We render the component they were trying to access (e.g., the Dashboard).
  return <>{children}</>;
};

export { ProtectedRoute }; // Make sure to export it correctly