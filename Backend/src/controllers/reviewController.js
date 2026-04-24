import Review from "../models/ReviewModel.js";
import Submission from "../models/SubmissionModel.js";
import Task from "../models/TaskModel.js";
import { logAction } from "../services/auditService.js";
import { notify } from "../services/notificationService.js";

export const reviewSubmission = async (req, res, next) => {
  try {
    const { feedback, qualityScore, decision } = req.body;
    const submissionId = req.params.submissionId;

    if (!decision || !["APPROVE", "REWORK"].includes(decision)) {
      return res.status(400).json({ message: "Decision must be APPROVE or REWORK" });
    }

    if (qualityScore !== undefined && (qualityScore < 1 || qualityScore > 10)) {
      return res.status(400).json({ message: "Quality score must be between 1 and 10" });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ message: "Submission not found" });
    }

    // Prevent re-reviewing an already approved submission
    if (submission.status === "APPROVED") {
      return res.status(400).json({ message: "This submission is already approved" });
    }

    const task = await Task.findById(submission.task);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Prevent reviewing if task already approved
    if (task.status === "APPROVED") {
      return res.status(400).json({ message: "Task is already approved" });
    }

    const review = await Review.create({
      submission: submissionId,
      reviewer: req.user.id,
      feedback,
      qualityScore,
      decision,
    });

    // Update submission status
    if (decision === "APPROVE") {
      submission.status = "APPROVED";
    } else {
      submission.status = "REWORK_REQUESTED";
    }
    await submission.save();

    // Update task status
    if (decision === "APPROVE") {
      task.status = "APPROVED";
    } else {
      task.status = "REWORK";
    }
    await task.save();

    // Notify Candidate
    await notify(submission.candidate, decision === "APPROVE" 
      ? "Your task has been approved."
      : "Your task needs rework. Please check feedback."
    );

    // Audit log (optional but recommended)
    if (logAction) {
      await logAction({
        action: decision === "APPROVE" ? "TASK_APPROVED" : "TASK_REWORK_REQUESTED",
        user: req.user.id,
        entityType: "Task",
        entityId: task._id,
        meta: { submissionId },
      });
    }

    res.status(201).json({ review, submission, task });
  } catch (err) {
    next(err);
  }
};
