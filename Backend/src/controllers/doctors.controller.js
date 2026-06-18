import mongoose from 'mongoose';
import Doctor from '../models/doctor.model.js';
import User from '../models/user.model.js';
import Queue from '../models/queue.model.js';

export const getDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email phone avatar');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getDoctorProfile = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id }).populate('user', 'name email phone avatar');
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const updateDoctorProfile = async (req, res) => {
  try {
    const updates = req.body;
    const doctor = await Doctor.findOneAndUpdate({ user: req.user._id }, updates, { new: true })
      .populate('user', 'name email phone avatar');
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const toggleAvailability = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    doctor.isAvailableToday = !doctor.isAvailableToday;
    await doctor.save();
    res.json({ isAvailableToday: doctor.isAvailableToday });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const queueStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    // ✅ Fixed: use new mongoose.Types.ObjectId() — required in Mongoose 7+
    const stats = await Queue.aggregate([
      { $match: { doctor: new mongoose.Types.ObjectId(req.params.id), date: today } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const singleDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email phone avatar');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}