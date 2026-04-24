import express from "express";
import {
  createTask,
  assignTask,
  assignReviewer,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../controllers/taskController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Create/update/delete: ADMIN or REVIEWER
router.post("/", protect, authorize("ADMIN", "REVIEWER"), createTask);
router.put("/:id", protect, authorize("ADMIN", "REVIEWER"), updateTask);
router.delete("/:id", protect, authorize("ADMIN", "REVIEWER"), deleteTask);

// Assign task to candidate
router.put("/:id/assign", protect, authorize("ADMIN", "REVIEWER"), assignTask);
router.patch("/:id/assign-candidate", protect, authorize("ADMIN", "REVIEWER"), assignTask);
router.patch("/:id/assign-reviewer", protect, authorize("ADMIN"), assignReviewer);


// View tasks
router.get("/", protect, authorize("ADMIN", "REVIEWER", "CANDIDATE"), getTasks);
router.get("/:id", protect, authorize("ADMIN", "REVIEWER", "CANDIDATE"), getTaskById);

export default router;

