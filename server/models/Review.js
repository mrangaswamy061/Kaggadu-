import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5, default: 5 },
  text: { type: String, required: true },
  image: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80' }
}, { timestamps: true });

export default mongoose.model('Review', ReviewSchema);
