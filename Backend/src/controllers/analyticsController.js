import { computeTaskAnalytics } from "../services/analyticsService.js";

export const getTaskAnalytics = async (req, res) => {
  const { taskId } = req.params;

  const analytics = await computeTaskAnalytics(taskId);
  if (!analytics) {
    return res.status(404).json({ message: "No submissions found for this task" });
  }

  res.json(analytics);
};
