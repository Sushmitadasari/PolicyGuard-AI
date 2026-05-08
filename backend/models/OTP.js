import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: String,

    otp: String,

    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "OTP",
  otpSchema
);