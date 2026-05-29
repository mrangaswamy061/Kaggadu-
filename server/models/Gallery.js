import mongoose from 'mongoose';

const GallerySchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true, enum: ['Sunrise', 'Forest', 'Beach'] },
  url: { type: String, required: true },
  type: { type: String, default: 'image' }
}, { timestamps: true });

export default mongoose.model('Gallery', GallerySchema);
