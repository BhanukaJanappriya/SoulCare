import React from "react";
import { Search, Bell, Settings } from "lucide-react";

const TopBar: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-sm"></div>
        </div>
        <div className="text-xl font-bold text-slate-700">SoulCare</div>
      </div>
      <div className="flex items-center space-x-4">
        <Search className="w-5 h-5 text-gray-500 cursor-pointer" />
        <Settings className="w-5 h-5 text-gray-500 cursor-pointer" />
        <div className="relative">
          <Bell className="w-5 h-5 text-gray-500 cursor-pointer" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full text-xs text-white flex items-center justify-center">
            2
          </span>
        </div>
        <img
          src="/soulCare/src/assets/user.jpg"
          className="w-10 h-10 rounded-full"
          alt="user"
        />
      </div>
    </div>
  );
};
export default TopBar;
