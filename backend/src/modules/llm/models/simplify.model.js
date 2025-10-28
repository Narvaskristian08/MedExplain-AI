import mongoose from "mongoose";

const simplificationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    isGuest: { type: Boolean, default: false },
    inputType: { type: String, enum: ["text", "doc", "pdf"], required: true },
    originalText: { type: String, required: true },
    simplifiedText: { type: String, required: true },
    simpScore: { type: Number, default: 0 }, // ✅ added
  },
  { timestamps: true } // ✅ enables createdAt and updatedAt
);

export default mongoose.model("Simplification", simplificationSchema);
