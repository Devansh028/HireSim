import express from "express";
import { getAuditLogs } from "../controllers/auditController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Only ADMIN can see audit logs
router.get("/", protect, authorize("ADMIN"), getAuditLogs);

export default router;
