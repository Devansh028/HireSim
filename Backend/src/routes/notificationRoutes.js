import express from "express";
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, getMyNotifications);
router.get("/me/unread-count", protect, getUnreadCount);
router.patch("/me/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);

export default router;
