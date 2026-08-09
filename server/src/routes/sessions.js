import express from "express";
const router = express.Router();
import { protect } from "../middleware/auth.js";
import {
  createSession,
  getSessions,
  getSession,
  startSession,
  endSession,
  addAttendee,
  getSessionAnalytics,
} from "../controllers/sessionController.js";

// Private routes - all require authentication
router.use(protect);

// Session management
router.post("/", createSession);
router.get("/", getSessions);
router.get("/:id", getSession);
router.put("/:id/start", startSession);
router.put("/:id/end", endSession);

// Attendee management
router.post("/:id/attendees", addAttendee);

// Analytics
router.get("/:id/analytics", getSessionAnalytics);

export default router;
