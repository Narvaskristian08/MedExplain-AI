import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalText: { type: String, required: true },
  simplifiedText: { type: String },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Document", documentSchema);