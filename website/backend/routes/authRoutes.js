import express from "express";

import {
  sendRegisterOTP,
  verifyRegisterOTP,
  sendLoginOTP,
  verifyLoginOTP,
  getProfile,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/register/send-otp",
  sendRegisterOTP
);

router.post(
  "/register/verify-otp",
  verifyRegisterOTP
);

router.post(
  "/login/send-otp",
  sendLoginOTP
);

router.post(
  "/login/verify-otp",
  verifyLoginOTP
);

router.get(
  "/profile",
  protect,
  getProfile
);

export default router;