import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        action: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
        entityType: String,
        entityId: mongoose.Schema.Types.ObjectId,
        meta: Object,
    },
    { timestamps: true}
);

export default mongoose.model("AuditLog", auditLogSchema);