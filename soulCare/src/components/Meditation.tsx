import React from "react";

const Meditation: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-heading">Meditation</h3>
        <svg
          className="w-5 h-5 text-labelText cursor-pointer"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2z"
          />
        </svg>
      </div>
      <div className="flex flex-col items-center text-center">
        <img
          src="https://via.placeholder.com/100" // Replace with actual meditation illustration
          alt="Meditation illustration"
          className="w-32 h-32 mb-4"
        />
        <p className="text-bodyText text-sm">
          Good vibes, good life
          <br />
          Positive thinking 12min
        </p>
        <button className="mt-4 px-4 py-2 bg-primaryBtn text-white rounded-full text-sm flex items-center space-x-2">
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
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          </svg>
          <span>Play</span>
        </button>
      </div>
    </div>
  );
};

export default Meditation;
