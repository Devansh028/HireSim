import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.get(
  "/admin-only",
  protect,
  authorize("ADMIN"),
  (req, res) => {
    res.json({ message: "Welcome Admin!" });
  }
);

export default router;
