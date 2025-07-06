import React from 'react';
import { FaCalendarAlt, FaWalking, FaChartBar, FaUtensils, FaSignOutAlt } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  return (
    <div className="bg-heading text-white w-20 min-h-screen flex flex-col items-center py-6 space-y-6">
        <span role="img" aria-label="Calendar" className="w-6 h-6"><FaCalendarAlt  /></span>
        <span role="img" aria-label="Steps" className="w-6 h-6"><FaWalking  /></span>
        <span role="img" aria-label="Progress" className="w-6 h-6"><FaChartBar  /></span>
        <span role="img" aria-label="Meal" className="w-6 h-6"><FaUtensils  /></span>
        <span role="img" aria-label="Logout" className="mt-auto w-6 h-6"><FaSignOutAlt  /></span>
    </div>
  );
};

export default Sidebar;