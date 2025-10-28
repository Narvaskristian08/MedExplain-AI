import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  term: { type: String, required: true },
  usagecount: { type: Number, default: 1 },
  simpScore: { type: Number, required: true },
  misunderstood: { type: Number, default: 0 }, // 1 or 0
  usageInstr: { type: Number, default: 0 },    // 1 or 0
  timestamp: { type: Date, default: Date.now }, // Changed to dynamic timestamp
});

export default mongoose.model('Analytics', analyticsSchema);