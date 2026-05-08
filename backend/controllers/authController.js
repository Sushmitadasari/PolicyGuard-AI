import User from "../models/User.js";
import OTP from "../models/OTP.js";

import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";
import generateToken from "../utils/generateToken.js";

export const sendRegisterOTP =
  async (req, res) => {
    try {
      const { name, email } =
        req.body;

      const existing =
        await User.findOne({
          email,
        });

      if (existing) {
        return res.status(400).json({
          message:
            "Email already exists",
        });
      }

      const otp = generateOTP();

      await OTP.deleteMany({
        email,
      });

      await OTP.create({
        email,
        otp,
        expiresAt:
          Date.now() +
          5 * 60 * 1000,
      });

      await sendEmail(email, otp);

      res.json({
        message: "OTP Sent",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

export const verifyRegisterOTP =
  async (req, res) => {
    try {
      const { name, email, otp } =
        req.body;

      const validOTP =
        await OTP.findOne({
          email,
          otp,
        });

      if (!validOTP) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }

      if (
        validOTP.expiresAt <
        Date.now()
      ) {
        return res.status(400).json({
          message: "OTP Expired",
        });
      }

      const user =
        await User.create({
          name,
          email,
        });

      await OTP.deleteMany({
        email,
      });

      const token =
        generateToken(user._id);

      res.json({
        token,
        user,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

export const sendLoginOTP =
  async (req, res) => {
    try {
      const { email } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const otp = generateOTP();

      await OTP.deleteMany({
        email,
      });

      await OTP.create({
        email,
        otp,
        expiresAt:
          Date.now() +
          5 * 60 * 1000,
      });

      await sendEmail(email, otp);

      res.json({
        message: "OTP Sent",
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

export const verifyLoginOTP =
  async (req, res) => {
    try {
      const { email, otp } =
        req.body;

      const validOTP =
        await OTP.findOne({
          email,
          otp,
        });

      if (!validOTP) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }

      if (
        validOTP.expiresAt <
        Date.now()
      ) {
        return res.status(400).json({
          message: "OTP Expired",
        });
      }

      const user =
        await User.findOne({
          email,
        });

      await OTP.deleteMany({
        email,
      });

      const token =
        generateToken(user._id);

      res.json({
        token,
        user,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };

export const getProfile =
  async (req, res) => {
    res.json({
      message:
        "Protected Route Accessed",
    });
  };