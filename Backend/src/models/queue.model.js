import mongoose from 'mongoose';

const queueSchema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tokenNumber: { type: Number, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: {
    type: String,
    enum: ['waiting', 'ongoing', 'completed', 'cancelled'],
    default: 'waiting'
  },
  isEmergency: { type: Boolean, default: false },
  problemDescription: { type: String },
  symptoms: [String],
  estimatedWaitTime: { type: Number, default: 0 }, // minutes
  appointedAt: { type: Date, default: Date.now },
  calledAt: { type: Date },
  completedAt: { type: Date },
  notes: { type: String },
  prescription: { type: mongoose.Schema.Types.ObjectId, ref: 'Prescription' },
}, { timestamps: true });

queueSchema.index({ doctor: 1, date: 1 });
queueSchema.index({ patient: 1, date: 1 });

const queueModel = mongoose.model('Queue', queueSchema)
export default queueModel;
