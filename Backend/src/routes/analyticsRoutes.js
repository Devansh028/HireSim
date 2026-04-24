import express from "express";
import { getTaskAnalytics } from "../controllers/analyticsController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Admin & Reviewer can view analytics
router.get(
  "/task/:taskId",
  protect,
  authorize("ADMIN", "REVIEWER"),
  getTaskAnalytics
);

export default router;
