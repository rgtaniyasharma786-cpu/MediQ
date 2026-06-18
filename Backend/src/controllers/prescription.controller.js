import Prescription from '../models/prescription.model.js';
import Queue from '../models/queue.model.js';
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';


export const patientPrescription = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

    const prescriptions = await Prescription.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
      .sort('-issuedAt');
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const issuedPrescription = async (req, res) => {
  try {
    const doc = await Doctor.findOne({ user: req.user._id });
    if (!doc) return res.status(404).json({ message: 'Doctor profile not found' });

    const prescriptions = await Prescription.find({ doctor: doc._id })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .sort('-issuedAt')
      .limit(50);
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const createPrescription = async (req, res) => {
  try {
    const { queueId, diagnosis, medicines, doctorNotes, followUpDate } = req.body;

    const queue = await Queue.findById(queueId).populate('doctor').populate('patient');
    if (!queue) return res.status(404).json({ message: 'Queue entry not found' });

    const prescription = await Prescription.create({
      queue: queueId,
      doctor: queue.doctor._id,
      patient: queue.patient._id,
      diagnosis,
      medicines,
      doctorNotes,
      followUpDate,
    });

    // Link prescription to queue and mark as completed
    await Queue.findByIdAndUpdate(queueId, {
      prescription: prescription._id,
      status: 'completed',
      completedAt: new Date(),
    });

    await prescription.populate([
      { path: 'doctor', populate: { path: 'user', select: 'name' } },
      { path: 'patient', populate: { path: 'user', select: 'name email' } },
    ]);

    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const prescriptionById = async (req, res) => {
  try {
    const prescription = await Prescription.findById(req.params.id)
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email' } });
    if (!prescription) return res.status(404).json({ message: 'Prescription not found' });
    res.json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}