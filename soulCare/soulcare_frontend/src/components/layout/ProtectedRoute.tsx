import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';


const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  console.log("--- PROTECTED ROUTE CHECK ---");
  console.log("Allowed Roles:", allowedRoles);
  console.log("Current User:", user);
  console.log("Is Loading:", isLoading);
  console.log("----------------------------");


  // This prevents the page from flickering to the login screen on a page refresh.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading session...</p>
      </div>
    );
  }


  if (!user) {
    
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  
  if (user && allowedRoles && allowedRoles.length > 0) {
    
    const isAuthorized = allowedRoles.includes(user.role);

    
    if (!isAuthorized) {
      
      if (user.role === 'user') {
        return <Navigate to="/" replace />;
      }
      
      
      return <Navigate to="/dashboard" replace />;
    }
  }

 
  return <>{children}</>;
};

export { ProtectedRoute }; 