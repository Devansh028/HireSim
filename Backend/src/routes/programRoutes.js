import express from "express";
import {
  createProgram,
  getPrograms,
  getProgramById,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Only ADMIN can create/update/delete
router.post("/", protect, authorize("ADMIN"), createProgram);
router.put("/:id", protect, authorize("ADMIN"), updateProgram);
router.delete("/:id", protect, authorize("ADMIN"), deleteProgram);

// ADMIN & REVIEWER can view
router.get("/", protect, authorize("ADMIN", "REVIEWER"), getPrograms);
router.get("/:id", protect, authorize("ADMIN", "REVIEWER"), getProgramById);

export default router;
