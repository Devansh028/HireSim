import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
    {
        task: { type:mongoose.Schema.Types.ObjectId, ref: "Task"},
        candidate: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
        version: { type: Number, default: 1},
        content: { type: String},     // text /link for now
        status: {
            type: String,
            enum: [ "SUBMITTED", "REWORK_REQUESTED", "APPROVED"],
            default: "SUBMITTED",
        },
        filePath: String,
        link: String,
},
{timestamps: true}
);

export default mongoose.model("Submission", submissionSchema); 