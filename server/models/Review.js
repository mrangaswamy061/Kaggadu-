import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  text: { type: String, required: true },
  email: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Review', ReviewSchema);
