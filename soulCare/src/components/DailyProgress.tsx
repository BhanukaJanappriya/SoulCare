import React from "react";

const DailyProgress: React.FC = () => {
  return (
    <div className="bg-cardBg p-4 rounded-xl text-center">
      <h3 className="font-semibold mb-2 text-heading">Daily Progress</h3>
      <div className="text-4xl font-bold text-primaryBtn">85%</div>
      <p className="text-sm mt-1">Keep working on your nutrition and sleep</p>
    </div>
  );
};

export default DailyProgress;
