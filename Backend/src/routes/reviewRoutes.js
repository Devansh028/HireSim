import express from "express";
import { reviewSubmission } from "../controllers/reviewController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Reviewer reviews a submission
router.post(
  "/:submissionId",
  protect,
  authorize("REVIEWER", "ADMIN"),
  reviewSubmission
);

export default router;
