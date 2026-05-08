import React from "react";
import { motion } from "framer-motion";

function NotificationToast({
  type,
  message,
}) {
  const colors = {
    success:
      "bg-green-500/10 border-green-500/20 text-green-400",
    warning:
      "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
    error:
      "bg-red-500/10 border-red-500/20 text-red-400",
    info:
      "bg-blue-500/10 border-blue-500/20 text-blue-400",
  };

  return (
    <motion.div
      initial={{
        x: 100,
        opacity: 0,
      }}
      animate={{
        x: 0,
        opacity: 1,
      }}
      className={`fixed top-10 right-10 z-50 px-6 py-4 rounded-2xl border backdrop-blur-3xl ${colors[type]}`}
    >
      {message}
    </motion.div>
  );
}

export default NotificationToast;