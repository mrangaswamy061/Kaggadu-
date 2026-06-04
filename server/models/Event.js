import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  eventId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  difficulty: { type: String, required: true, enum: ['Easy', 'Moderate', 'Challenging'] },
  price: { type: Number, required: true },
  slots: { type: Number, required: true },
  bookedSlots: { type: Number, default: 0 },
  image: { type: String, required: true },
  status: { type: String, required: true, enum: ['draft', 'published'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  registrationsEnabled: { type: Boolean, default: true },
  createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('Event', EventSchema);
