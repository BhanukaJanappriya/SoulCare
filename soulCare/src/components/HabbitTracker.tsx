import React from "react";
import { FaRunning, FaTint, FaUtensils } from "react-icons/fa";

const HabitTracker: React.FC = () => {
  return (
    <div className="bg-cardBg p-4 rounded-xl">
      <h3 className="font-semibold mb-2 text-heading">Habit Tracker</h3>
      <ul className="space-y-2 text-sm">
        <li>
          <FaRunning className="inline-block mr-2 text-success" /> Morning run -
          07:00am
        </li>
        <li>
          <FaTint className="inline-block mr-2 text-primaryBtn" /> 1.5L of water
          - All day
        </li>
        <li>
          <FaUtensils className="inline-block mr-2 text-secondaryBtn" />{" "}
          Mealprep - 11:00am
        </li>
      </ul>
    </div>
  );
};

export default HabitTracker;
