import React from "react";

const Meditation: React.FC = () => {
  return (
    <div className="bg-cardBg p-4 rounded-xl flex flex-col justify-between">
      <h3 className="font-semibold text-heading">Meditation</h3>
      <div className="text-sm mt-2">Good vibes, good life</div>
      <div className="text-sm text-labelText">Positive thinking | 27min</div>
      <button className="mt-4 bg-primaryBtn text-white rounded-full px-4 py-1">
        ▶
      </button>
    </div>
  );
};

export default Meditation;
