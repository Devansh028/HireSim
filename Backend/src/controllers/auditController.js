import AuditLog from "../models/AuditLogModel.js";
import { getPagination } from "../utils/pagination.js";

export const getAuditLogs = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const { action, user } = req.query;

    const filter = {};
    if (action) filter.action = action;
    if (user) filter.user = user;

    const [items, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email role"),
      AuditLog.countDocuments(filter),
    ]);

    res.json({ page, limit, total, pages: Math.ceil(total / limit), items });
  } catch (err) {
    next(err);
  }
};
