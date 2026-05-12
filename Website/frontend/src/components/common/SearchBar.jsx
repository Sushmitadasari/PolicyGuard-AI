import React from "react";
import { motion } from "framer-motion";

function SearchBar() {
  return (
    <motion.div
      whileFocus={{ scale: 1.01 }}
      className="w-full max-w-xl"
    >
      <input
        type="text"
        placeholder="Search analyses, reports..."
        className="w-full h-14 rounded-2xl bg-white/[0.04] border border-white/10 px-6 outline-none focus:border-blue-500 text-white placeholder:text-white/30"
      />
    </motion.div>
  );
}

export default SearchBar;