import Submission from "../models/SubmissionModel.js";
import Task from "../models/TaskModel.js";
import { logAction } from "../services/auditService.js";
import { getPagination } from "../utils/pagination.js";  

// Candidate submits or resubmits
export const submitTask = async (req, res, next) => {
  try {
    const { content } = req.body;
    const taskId = req.params.taskId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Submission content is required" });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (!task.assignedTo) {
      return res.status(400).json({ message: "Task is not assigned to any candidate" });
    }

    // Prevent submitting if already approved
    if (task.status === "APPROVED") {
      return res.status(400).json({ message: "Task is already approved. No more submissions allowed." });
    }

    // Only assigned candidate can submit
    if (task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your task" });
    }

    // Find latest version
    const lastSubmission = await Submission.findOne({ task: taskId }).sort({ version: -1 });
    const newVersion = lastSubmission ? lastSubmission.version + 1 : 1;

    const submission = await Submission.create({
      task: taskId,
      candidate: req.user.id,
      version: newVersion,
      content,
      status: "SUBMITTED",
    });

    // Update task status
    task.status = "SUBMITTED";
    await task.save();

    // Audit log (optional but recommended)
    if (logAction) {
      await logAction({
        action: "SUBMISSION_CREATED",
        user: req.user.id,
        entityType: "Submission",
        entityId: submission._id,
        meta: { taskId, version: newVersion },
      });
    }

    res.status(201).json(submission);
  } catch (err) {
    next(err);
  }
};

// Get all submissions for a task
export const getSubmissionsByTask = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);

    const [items, total] = await Promise.all([
      Submission.find({ task: req.params.taskId })
        .sort({ version: 1 })
        .skip(skip)
        .limit(limit)
        .populate("candidate", "name email"),
      Submission.countDocuments({ task: req.params.taskId }),
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), items });
  } catch (err) {
    next(err);
  }
};

