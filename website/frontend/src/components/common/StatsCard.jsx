import React from "react";
import { motion } from "framer-motion";

function StatsCard({
  title,
  value,
  growth,
  icon,
}) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-3xl"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[80px]" />

      <div className="relative z-10">
        <div className="text-5xl mb-6">
          {icon}
        </div>

        <p className="text-white/40 text-sm mb-3">
          {title}
        </p>

        <h2 className="text-5xl font-black mb-4">
          {value}
        </h2>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold">
          ↑ {growth}
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;