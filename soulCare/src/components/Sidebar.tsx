import React from "react";
import {
  FaCalendarAlt,
  FaWalking,
  FaChartBar,
  FaUtensils,
  FaSignOutAlt,
} from "react-icons/fa";

const Sidebar: React.FC = () => {
  return (
    <div className="bg-heading text-white w-20 min-h-screen flex flex-col items-center py-6 space-y-6">
      <img src="/assets/logo.png" alt="logo" className="w-10 h-10 mb-6" />
      <FaCalendarAlt className="w-6 h-6" aria-label="Calendar" />
      <FaWalking className="w-6 h-6" aria-label="Steps" />
      <FaChartBar className="w-6 h-6" aria-label="Progress" />
      <FaUtensils className="w-6 h-6" aria-label="Meal" />
      <FaSignOutAlt className="w-6 h-6 mt-auto" aria-label="Logout" />
    </div>
  );
};

export default Sidebar;
