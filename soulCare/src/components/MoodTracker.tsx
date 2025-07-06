import React from "react";

const MoodTracker: React.FC = () => {
  return (
    <div className="bg-cardBg p-4 rounded-xl col-span-2">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-heading">Mood Tracker</h3>
        <button className="text-sm text-labelText">Month</button>
      </div>
      <div className="h-40 bg-divider rounded-md">[Mood Chart Here]</div>
    </div>
  );
};

export default MoodTracker;
