import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  bloodGroup: { type: String },
  address: { type: String },
  emergencyContact: {
    name: String,
    phone: String,
    relation: String,
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    notes: String,
  }],
  allergies: [String],
  currentMedications: [String],
}, { timestamps: true });

const patientModel = mongoose.model('Patient', patientSchema)
export default patientModel;
