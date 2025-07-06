import React from "react";
import UserDashboard from './components/UserDashboard';

const App: React.FC = () =>{
  return(
    <div className="min-h-screen bg-pageBg text-bodyText font-sans">
      <UserDashboard/>
    </div>
    
  )
}