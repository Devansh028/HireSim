import { analyzeTaskRisk } from "../services/riskService.js";

export const getTaskRisk = async (req, res) => {
  const { taskId } = req.params;

  const result = await analyzeTaskRisk(taskId);
  if (!result) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.json(result);
};
