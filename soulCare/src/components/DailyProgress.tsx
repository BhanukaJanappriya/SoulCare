import React from "react";

const DailyProgress: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Daily progress
      </h3>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="2"
          />
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="85, 100"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-slate-700">85%</span>
        </div>
      </div>
      <p className="text-sm text-gray-600">
        Keep working on your nutrition and sleep
      </p>
    </div>
  );
};

export default DailyProgress;
