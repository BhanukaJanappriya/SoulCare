import React from "react";
import { FaSearch, FaBell } from "react-icons/fa";

const TopBar: React.FC = () => {
  return (
    <div className="flex justify-between items-center">
      <div className="text-xl font-bold text-primaryBtn">SoulCare</div>
      <div className="flex items-center space-x-4">
        <FaSearch className="text-labelText" />
        <FaBell className="text-labelText" />
        <img
          src="/assets/avatar.png"
          className="w-8 h-8 rounded-full"
          alt="user"
        />
      </div>
    </div>
  );
};
export default TopBar;
