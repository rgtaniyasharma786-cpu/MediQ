import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  specialization: { type: String, required: true },
  qualification: { type: String },
  experience: { type: Number, default: 0 },
  fees: { type: Number, required: true },
  availability: {
    days: [{ type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }],
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
  },
  isAvailableToday: { type: Boolean, default: true },
  maxPatientsPerDay: { type: Number, default: 30 },
  currentTokenNumber: { type: Number, default: 0 },
  room: { type: String },
  rating: { type: Number, default: 4.5 },
  totalPatientsSeen: { type: Number, default: 0 },
}, { timestamps: true });

const doctorModel = mongoose.model('Doctor', doctorSchema)
export default doctorModel;
