import React from "react";
import { motion } from "framer-motion";

function AIStatusBadge({ status = "Active" }) {
  const colors = {
    Active: "bg-green-500",
    Scanning: "bg-blue-500",
    Warning: "bg-yellow-500",
    Offline: "bg-red-500",
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.04] border border-white/10">
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
        className={`w-3 h-3 rounded-full ${colors[status]}`}
      />

      <span className="text-sm text-white/70 font-semibold">
        AI {status}
      </span>
    </div>
  );
}

export default AIStatusBadge;