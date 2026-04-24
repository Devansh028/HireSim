import Submission from "../models/SubmissionModel.js";
import Review from "../models/ReviewModel.js";
import Task from "../models/TaskModel.js";

export const analyzeTaskRisk = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) return null;

  const submissions = await Submission.find({ task: taskId }).sort({ version: 1 });
  if (submissions.length === 0) {
    return {
      riskLevel: "LOW",
      reasons: ["No submissions yet"],
      signals: {},
    };
  }

  const reviews = await Review.find({
    submission: { $in: submissions.map(s => s._id) }
  });

  const reasons = [];
  const signals = {
    fastSubmission: false,
    noImprovement: false,
    hugeContentJump: false,
  };

  // 1️⃣ Too fast for difficulty
  const first = submissions[0];
  const submitTimeMinutes = (first.createdAt - task.createdAt) / (1000 * 60);

  const difficultyThreshold = {
    EASY: 30,
    MEDIUM: 60,
    HARD: 120,
  };

  if (submitTimeMinutes < difficultyThreshold[task.difficulty || "MEDIUM"]) {
    signals.fastSubmission = true;
    reasons.push("Unusually fast submission for task difficulty");
  }

  // 2️⃣ No improvement after rework
  const reworkReviews = reviews.filter(r => r.decision === "REWORK");
  if (reworkReviews.length > 0 && reviews.length > 1) {
    const scores = reviews.map(r => r.qualityScore).filter(Boolean);
    if (scores.length >= 2) {
      const firstScore = scores[0];
      const lastScore = scores[scores.length - 1];
      if (lastScore <= firstScore) {
        signals.noImprovement = true;
        reasons.push("No quality improvement after rework requests");
      }
    }
  }

  // 3️⃣ Huge content size jump between versions
  if (submissions.length >= 2) {
    for (let i = 1; i < submissions.length; i++) {
      const prevLen = (submissions[i - 1].content || "").length;
      const currLen = (submissions[i].content || "").length;
      if (prevLen > 0 && currLen / prevLen > 3) {
        signals.hugeContentJump = true;
        reasons.push("Sudden large change in submission content between versions");
        break;
      }
    }
  }

  // 🎯 Decide risk level
  const trueSignals = Object.values(signals).filter(Boolean).length;

  let riskLevel = "LOW";
  if (trueSignals === 1) riskLevel = "MEDIUM";
  if (trueSignals >= 2) riskLevel = "HIGH";

  return {
    taskId,
    riskLevel,
    reasons,
    signals,
  };
};
