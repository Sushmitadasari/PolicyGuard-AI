import React from "react";
import { motion } from "framer-motion";

function Loader() {
  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }}
        className="w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent"
      />
    </div>
  );
}

export default Loader;