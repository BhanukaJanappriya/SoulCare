import React from "react";

const Activity: React.FC = () => {
  return (
    <div className="bg-cardBg p-4 rounded-xl">
      <div className="flex justify-between mb-2">
        <h3 className="font-semibold text-heading">Activity</h3>
        <button className="text-sm text-labelText">Week</button>
      </div>
      <div className="space-y-2">
        <div className="text-sm">
          Heart rate: <strong>130 bpm</strong>
        </div>
        <div className="text-sm">
          Total steps: <strong>5500</strong>
        </div>
        <div className="text-sm">
          Game points: <strong>534</strong>
        </div>
      </div>
    </div>
  );
};

export default Activity;
