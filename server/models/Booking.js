import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  emergencyContact: { type: String, required: true },
  selectedTrek: { type: String, required: true },
  trekDate: { type: String, required: true }, // Store trek date separately
  paymentScreenshot: { type: String, required: true }, // Base64 or Image URL path
  status: { type: String, required: true, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

export default mongoose.model('Booking', BookingSchema);
