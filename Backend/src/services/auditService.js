import AuditLog from "../models/AuditLogModel.js";

export const logAction = async ({ action, user, entityType, entityId, meta }) => {
  try {
    await AuditLog.create({
      action,
      user,
      entityType,
      entityId,
      meta,
    });
  } catch (err) {
    console.error("Audit log failed:", err.message);
  }
};
