import express from "express";
import {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
  sendOTP,
  verifyOTP,
  getZoomSignature,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Gmail OTP authentication
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Private routes
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentUser);
router.put("/profile", protect, updateProfile);
router.post("/zoom-signature", protect, getZoomSignature);

export default router;
