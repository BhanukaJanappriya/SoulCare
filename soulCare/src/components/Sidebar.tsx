import React from "react";
import {
  Calendar,
  Activity,
  BarChart3,
  Utensils,
  LogOut,
  Search,
  Bell,
  Settings,
  Play,
  MoreHorizontal,
  MapPin,
  Clock,
  Users,
} from "lucide-react";

const Sidebar: React.FC = () => {
  return (
    <div className="bg-slate-700 text-white w-20 min-h-screen flex flex-col items-center py-6 space-y-6">
      <div className="w-10 h-10 mb-6 bg-blue-500 rounded-lg flex items-center justify-center">
        <div className="grid grid-cols-2 gap-0.5">
          <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-sm"></div>
        </div>
      </div>
      <FaCalendar className="w-6 h-6 text-white cursor-pointer hover:text-blue-300" />
      <FaActivity className="w-6 h-6 text-white cursor-pointer hover:text-blue-300" />
      <BarChart3 className="w-6 h-6 text-white cursor-pointer hover:text-blue-300" />
      <Utensils className="w-6 h-6 text-white cursor-pointer hover:text-blue-300" />
      <div className="w-6 h-6 bg-white rounded cursor-pointer hover:bg-gray-200"></div>
      <LogOut className="w-6 h-6 text-white cursor-pointer hover:text-blue-300 mt-auto" />
    </div>
  );
};

export default Sidebar;
