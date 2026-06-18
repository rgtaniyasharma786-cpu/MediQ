import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  queue: { type: mongoose.Schema.Types.ObjectId, ref: 'Queue', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  diagnosis: { type: String },
  medicines: [{
    name: String,
    dosage: String,
    frequency: String,
    duration: String,
    instructions: String,
  }],
  doctorNotes: { type: String },
  followUpDate: { type: Date },
  pdfUrl: { type: String },
  issuedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const prescriptionModel = mongoose.model('Prescription', prescriptionSchema)
export default prescriptionModel;
