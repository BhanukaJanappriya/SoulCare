import React from "react";

const Activity: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700">Activity</h3>
        <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
          Week
        </button>
      </div>
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Heart rate</div>
            <div className="font-semibold text-slate-700">130 bpm</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total steps</div>
            <div className="font-semibold text-slate-700">5500</div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
            <div className="w-5 h-5 bg-teal-500 rounded-full"></div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Game points</div>
            <div className="font-semibold text-slate-700">534</div>
          </div>
        </div>
      </div>
      <div className="mt-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Move</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-400 h-2 rounded-full"
            style={{ width: "70%" }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Game Points</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-teal-400 h-2 rounded-full"
            style={{ width: "90%" }}
          ></div>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Steps</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: "55%" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Activity;
