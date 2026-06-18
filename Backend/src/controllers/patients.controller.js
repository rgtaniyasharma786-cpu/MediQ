import Patient from '../models/patient.model.js';
import Notification from '../models/notification.model.js';


export const patientProfile = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const updateProfile = async (req, res) => {
  try {
    const { gender, dateOfBirth, bloodGroup, address, emergencyContact, medicalHistory, allergies } = req.body;
    const patient = await Patient.findOneAndUpdate(
      { user: req.user._id },
      { gender, dateOfBirth, bloodGroup, address, emergencyContact, medicalHistory, allergies },
      { new: true }
    ).populate('user', 'name email phone avatar');
    res.json(patient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getNotification = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt').limit(20);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const markRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}