import mongoose from 'mongoose';

const TrekSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  tagline: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Moderate', 'Challenging'] },
  difficultyLevel: { type: Number, required: true, min: 0, max: 100 },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  distance: { type: String, default: '12 km' },
  date: { type: String, required: true },
  image: { type: String, required: true },
  highlights: [{ type: String }],
  pickupPoints: [{ type: String }],
  inclusions: [{ type: String }],
  exclusions: [{ type: String }],
  itinerary: [{
    day: { type: String },
    title: { type: String },
    desc: { type: String }
  }],
  gallery: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Trek', TrekSchema);
