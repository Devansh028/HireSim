import Task from "../models/TaskModel.js";
import User from "../models/UserModel.js";
import { logAction } from "../services/auditService.js";
import { notify } from "../services/notificationService.js";
import { getPagination } from "../utils/pagination.js";

// Create Task
export const createTask = async (req, res, next) => {
  try {
    const { program, title, description, difficulty, deadline } = req.body;

    if (!program || !title || !title.trim()) {
      return res.status(400).json({ message: "Program and title are required" });
    }

    if (difficulty && !["EASY", "MEDIUM", "HARD"].includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty" });
    }

    const task = await Task.create({
      program,
      title,
      description,
      difficulty,
      deadline,
    });

    if (logAction) {
      await logAction({
        action: "TASK_CREATED",
        user: req.user.id,
        entityType: "Task",
        entityId: task._id,
        meta: { title: task.title },
      });
    }

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

// Assign Task
export const assignTask = async (req, res, next) => {
  try {
    const { candidateId } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "candidateId is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.status === "APPROVED") {
      return res.status(400).json({ message: "Cannot assign an approved task" });
    }

    const candidate = await User.findById(candidateId);
    if (!candidate || candidate.role !== "CANDIDATE") {
      return res.status(400).json({ message: "Assigned user must be a CANDIDATE" });
    }

    task.assignedTo = candidateId;
    task.status = "ASSIGNED";
    await task.save();

    // Notify Candidate
    await notify(candidateId, " A new task has been assigned to you.");

    if (logAction) {
      await logAction({
        action: "TASK_ASSIGNED",
        user: req.user.id,
        entityType: "Task",
        entityId: task._id,
        meta: { candidateId },
      });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const assignReviewer = async (req, res) => {
  const { reviewerId } = req.body;

  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { reviewer: reviewerId },
    { new: true }
  )
    .populate("program")
    .populate("assignedTo", "name email role")
    .populate("reviewer", "name email role");

  if (!task) return res.status(404).json({ message: "Task not found" });

  res.json(task);
};


// Get all tasks
export const getTasks = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { status, difficulty, program } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (difficulty) filter.difficulty = difficulty;
    if (program) filter.program = program;

    const [items, total] = await Promise.all([
      Task.find(filter)
        .skip(skip)
        .limit(limit)
        .populate("program")
        .populate("assignedTo", "name email role"),
      Task.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (err) {
    next(err);
  }
};


// Get task by ID
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("program")
      .populate("assignedTo", "name email role");

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    next(err);
  }
};

// Update Task (restricted fields)
export const updateTask = async (req, res, next) => {
  try {
    const updates = { ...req.body };

    // Prevent breaking workflow via update
    delete updates.status;
    delete updates.assignedTo;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (logAction) {
      await logAction({
        action: "TASK_UPDATED",
        user: req.user.id,
        entityType: "Task",
        entityId: task._id,
      });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
};

// Delete Task
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (logAction) {
      await logAction({
        action: "TASK_DELETED",
        user: req.user.id,
        entityType: "Task",
        entityId: task._id,
      });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    next(err);
  }
};



