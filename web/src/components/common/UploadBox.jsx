import React from "react";
import { motion } from "framer-motion";

function UploadBox({
  acceptedFiles,
  onUpload,
}) {
  return (
    <motion.label
      whileHover={{
        scale: 1.01,
      }}
      className="relative flex flex-col items-center justify-center h-[350px] rounded-[3rem] border-2 border-dashed border-white/10 bg-white/[0.03] cursor-pointer overflow-hidden"
    >
      <input
        type="file"
        accept={acceptedFiles}
        className="hidden"
        onChange={onUpload}
      />

      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5" />

      <div className="relative z-10 text-center">
        <div className="text-7xl mb-8">
          📂
        </div>

        <h2 className="text-3xl font-black mb-4">
          Upload Document
        </h2>

        <p className="text-white/40">
          Drag & Drop or Click to Upload
        </p>
      </div>
    </motion.label>
  );
}

export default UploadBox;