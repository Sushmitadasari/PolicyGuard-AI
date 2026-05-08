import React from "react";

function RiskCard({
  level,
  score,
  explanation,
}) {
  const colors = {
    low: "border-green-500/20 bg-green-500/5",
    medium:
      "border-yellow-500/20 bg-yellow-500/5",
    high: "border-red-500/20 bg-red-500/5",
  };

  return (
    <div
      className={`rounded-[2rem] border p-8 ${colors[level]}`}
    >
      <h2 className="text-4xl font-black mb-4">
        {score}%
      </h2>

      <p className="uppercase tracking-[0.2em] text-sm text-white/50 mb-5">
        {level} risk
      </p>

      <p className="text-white/60 leading-relaxed">
        {explanation}
      </p>
    </div>
  );
}

export default RiskCard;