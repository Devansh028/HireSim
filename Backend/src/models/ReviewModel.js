import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        submission: { type: mongoose.Schema.Types.ObjectId, ref: "Submission"},
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
        feedback: String,
        qualityScore: { type: Number, min: 1, max: 10},
        decision: { type: String, enum: ["APPROVE", "REWORK"]},
    },
    {timestamps: true}
);

export default mongoose.model("Review", reviewSchema);