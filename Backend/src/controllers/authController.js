import User from "../models/UserModel.js";
import { generateToken } from "../utils/jwt.js";


// Get all users (admin use — for dropdowns)
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password").sort({ name: 1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};


// Register
export const register = async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ name, email, password, role });
  const token = generateToken(user);

  res.json({ user, token });
};


// Login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user);
  res.json({ user, token });
};
