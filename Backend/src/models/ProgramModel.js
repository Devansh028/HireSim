import mongoose from "mongoose";

const programSchema = new mongoose.Schema( {
    name:{ type: String, required: true},
    description: String,
    createdBy: { type:mongoose.Schema.Types.ObjectId, ref:"User"},
},
{ timestamps: true}
);

export default mongoose.model("Program", programSchema);