import express from "express";
import { submitTask, getSubmissionsByTask } from "../controllers/submissionController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";
import { upload } from "../config/upload.js";

const router = express.Router();

// Candidate submits task
router.post(
  "/:taskId/submit",
  protect,
  authorize("CANDIDATE"),
  upload.single("file"),
  submitTask
);

// Reviewer/Admin can view submissions
router.get(
  "/:taskId",
  protect,
  authorize("ADMIN", "REVIEWER"),
  getSubmissionsByTask
);

export default router;
