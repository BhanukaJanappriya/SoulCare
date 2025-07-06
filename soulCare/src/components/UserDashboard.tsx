import React from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import MoodTracker from "./MoodTracker";
import Activity from "./Activity";
import HabitTracker from "./HabbitTracker";
import DailyProgress from "./DailyProgress";
import Meditation from "./Meditation";

const UserDashboard: React.FC = () => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-8">
        <TopBar />
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-sm text-gray-500">Dashboard</div>
              <h2 className="text-3xl font-bold text-heading">Hi, Bhanuka!</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-cardBg text-labelText rounded-full text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>May 03 - May 18</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-cardBg text-labelText rounded-full text-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>24h</span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <MoodTracker />
          <Activity />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <HabitTracker />
          <DailyProgress />
          <Meditation />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
