import Submission from "../models/SubmissionModel.js";
import Review from "../models/ReviewModel.js";
import Task from "../models/TaskModel.js";

export const computeTaskAnalytics = async (taskId) => {
  const submissions = await Submission.find({ task: taskId }).sort({ version: 1 });
  if (submissions.length === 0) return null;

  const reviews = await Review.find({
    submission: { $in: submissions.map(s => s._id) }
  });

  const task = await Task.findById(taskId);

  // Iterations
  const iterationCount = submissions.length;

  // Reworks = number of times decision was REWORK
  const reworkCount = reviews.filter(r => r.decision === "REWORK").length;

  // Quality average
  const qualityScores = reviews.map(r => r.qualityScore).filter(Boolean);
  const qualityAvg = qualityScores.length
    ? qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length
    : 0;

  // Turnaround time (first submit → approval)
  let turnaroundHours = 0;
  const approvedSubmission = submissions.find(s => s.status === "APPROVED");
  if (approvedSubmission) {
    const first = submissions[0].createdAt;
    const last = approvedSubmission.updatedAt;
    turnaroundHours = Math.max(1, (last - first) / (1000 * 60 * 60));
  }

  // Normalize scores (0–10)
  const speedScore = Math.max(1, Math.min(10, 10 - turnaroundHours)); // faster = higher
  const iterationScore = Math.max(1, Math.min(10, 10 - iterationCount));
  const consistency = Math.max(1, Math.min(10, 10 - reworkCount));

  // Work Readiness Score (0–10 scale)
  const workReadinessScore = (qualityAvg * 0.5) + (consistency * 0.2) + (speedScore * 0.2) + (iterationScore * 0.1);

  return {
    taskId,
    iterationCount,
    reworkCount,
    qualityAvg: Number(qualityAvg.toFixed(2)),
    turnaroundHours: Number(turnaroundHours.toFixed(2)),
    speedScore,
    iterationScore,
    consistency,
    workReadinessScore: Number(workReadinessScore.toFixed(2)),
  };
};
