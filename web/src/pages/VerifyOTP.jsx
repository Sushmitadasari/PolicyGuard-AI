import React, {
  useState,
} from "react";

import {
  motion,
} from "framer-motion";

function VerifyOTP({
  onVerify,
}) {
  const [otp, setOtp] =
    useState("");

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">

      <motion.div
        initial={{
          opacity: 0,
          y: 30,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="w-full max-w-md p-10 rounded-[3rem] border border-white/10 bg-white/[0.03]"
      >

        <h1 className="text-4xl font-black mb-4">
          Verify OTP
        </h1>

        <p className="text-white/50 mb-8">
          Enter the 6-digit OTP sent to your email.
        </p>

        <input
          type="text"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value
            )
          }
          placeholder="123456"
          className="w-full h-16 rounded-2xl bg-white/[0.03] border border-white/10 px-6 mb-6 outline-none"
        />

        <button
          onClick={() =>
            onVerify(otp)
          }
          className="w-full h-16 rounded-2xl bg-blue-600 font-black"
        >
          Verify OTP
        </button>

      </motion.div>

    </div>
  );
}

export default VerifyOTP;