import React from "react";
import { Search, Bell, MessageCircle } from "lucide-react";

const Header: React.FC = () => {
  return (
    <header className="bg-primary-50 mx-10 mt-4 rounded-xl p-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-14 h-14 rounded-lg flex items-center justify-center">
          <img
            src="D:/My Projects/web/SoulCare/SoulCare/src/assets/SoulCare.png"
            alt="SoulCare Logo"
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-medium text-primary-600">SoulCare</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="w-10 h-10 bg-primary-300 bg-opacity-87 rounded-full flex items-center justify-center">
          <Search className="w-6 h-6 text-primary-500" />
        </button>

        <button className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
          <Bell className="w-6 h-6 text-white" />
        </button>

        <div className="relative">
          <button className="w-10 h-10 bg-primary-400 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-medium text-secondary-500">2</span>
          </div>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden">
          <img
            src="D:/My Projects/web/SoulCare/SoulCare/src/assets/user1.jpg"
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
