import React from "react";
import { motion } from "framer-motion";

function PageHeader({
  title,
  subtitle,
  actionButton,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
      <div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black tracking-tight"
        >
          {title}
        </motion.h1>

        <p className="text-white/40 text-lg mt-3">
          {subtitle}
        </p>
      </div>

      {actionButton}
    </div>
  );
}

export default PageHeader;