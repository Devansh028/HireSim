import express from "express";
import { getTaskRisk } from "../controllers/riskController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Only ADMIN & REVIEWER can view risk analysis
router.get(
  "/task/:taskId",
  protect,
  authorize("ADMIN", "REVIEWER"),
  getTaskRisk
);

export default router;
