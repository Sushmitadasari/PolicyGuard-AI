import React from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

function Modal({
  open,
  onClose,
  children,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-6"
        >
          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0.8,
              opacity: 0,
            }}
            className="w-full max-w-2xl rounded-[3rem] border border-white/10 bg-[#0f172a] p-10"
          >
            {children}

            <button
              onClick={onClose}
              className="mt-8 w-full h-14 rounded-2xl bg-white/5 border border-white/10"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Modal;