import React from "react";
const RiskMeter = ({ score, level }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">
          Privacy Risk
        </h2>

        <span className="text-red-400 font-bold">
          {level}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="w-32 h-32 rounded-full border-[10px] border-red-500 flex items-center justify-center text-3xl font-bold">
          {score}%
        </div>

        <p className="text-gray-400 mt-4 text-sm">
          High Privacy Risk Detected
        </p>
      </div>
    </div>
  );
};

export default RiskMeter;