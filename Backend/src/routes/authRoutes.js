import express from "express";
import { register, login, getUsers } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, authorize("ADMIN", "REVIEWER", "CANDIDATE"), (req, res) => {
  res.json({ message: "You are authenticated", user: req.user });
});

router.get("/users", protect, authorize("ADMIN", "REVIEWER"), getUsers);

export default router;
