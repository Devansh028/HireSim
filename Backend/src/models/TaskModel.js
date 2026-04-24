import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    program: { type: mongoose.Schema.Types.ObjectId, ref: "Program", required: true },
    title: {
      type: String,
      required: true,
    },
    description: String,
    difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "EASY" },
    deadline: Date,

    status: {
      type: String,
      enum: ["CREATED", "ASSIGNED", "SUBMITTED", "REWORK", "APPROVED"],
      default: "CREATED",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Task", taskSchema);
