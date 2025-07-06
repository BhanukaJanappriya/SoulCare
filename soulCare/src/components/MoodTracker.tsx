import React from "react";

const MoodTracker: React.FC = () => {
  const moodData = [
    { month: "Jan", value: 1000 },
    { month: "Feb", value: 800 },
    { month: "Mar", value: 1200 },
    { month: "Apr", value: 900 },
    { month: "May", value: 600 },
    { month: "Jun", value: 1000 },
    { month: "Jul", value: 1100 },
    { month: "Sep", value: 1800 },
    { month: "Aug", value: 800 },
    { month: "Oct", value: 1200 },
    { month: "Nov", value: 700 },
    { month: "Dec", value: 900 },
  ];

  const maxValue = Math.max(...moodData.map((d) => d.value));

  return (
    <div className="bg-white p-6 rounded-2xl col-span-2 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700">Mood Tracker</h3>
        <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
          Month
        </button>
      </div>
      <div className="h-48 relative">
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 pr-2">
          <span>2000</span>
          <span>1000</span>
          <span>500</span>
          <span>100</span>
          <span>0</span>
        </div>
        <div className="ml-8 h-full flex items-end justify-between space-x-2">
          {moodData.map((item, index) => (
            <div key={item.month} className="flex flex-col items-center flex-1">
              <div
                className={`w-full rounded-t-lg ${
                  index === 7 ? "bg-teal-400" : "bg-blue-300"
                } transition-all duration-300`}
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              ></div>
              <span className="text-xs text-gray-500 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MoodTracker;
