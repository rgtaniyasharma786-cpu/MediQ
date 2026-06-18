import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import Queue from '../models/queue.model.js';
import Notification from '../models/notification.model.js';

//==========================User Management====================


// Get all users

 export const getUser = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const userStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ isActive: user.isActive, message: `User ${user.isActive ? 'unblocked' : 'blocked'} successfully` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const updateProfile = async (req, res) => {
  try {
    const { name, phone, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, phone, email },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


// =====================Doctor Management==================
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, phone, specialization, fees, qualification, experience, availability, room, maxPatientsPerDay } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password, role: 'doctor', phone });
    const doctor = await Doctor.create({
      user: user._id,
      specialization,
      fees,
      qualification,
      experience,
      maxPatientsPerDay: maxPatientsPerDay || 30,
      availability: availability || { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '17:00' },
      room,
    });

    await doctor.populate('user', 'name email phone');
    res.status(201).json(doctor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const updateDoctor = async (req, res) => {
  try {
    const { name, phone, specialization, fees, qualification, experience, availability, isAvailableToday, room, maxPatientsPerDay } = req.body;
    const doctor = await Doctor.findById(req.params.id).populate('user');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await User.findByIdAndUpdate(doctor.user._id, { name, phone });
    const updated = await Doctor.findByIdAndUpdate(
      req.params.id,
      { specialization, fees, qualification, experience, availability, isAvailableToday, room, maxPatientsPerDay },
      { new: true }
    ).populate('user', 'name email phone avatar');

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    await User.findByIdAndUpdate(doctor.user, { isActive: false });
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


// =================Token & Queue Management=================

export const allDoctors = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const doctors = await Doctor.find().populate('user', 'name avatar');

    const monitorData = await Promise.all(doctors.map(async (doc) => {
      const [waiting, ongoing, completed, cancelled, emergency] = await Promise.all([
        Queue.countDocuments({ doctor: doc._id, date: today, status: 'waiting' }),
        Queue.countDocuments({ doctor: doc._id, date: today, status: 'ongoing' }),
        Queue.countDocuments({ doctor: doc._id, date: today, status: 'completed' }),
        Queue.countDocuments({ doctor: doc._id, date: today, status: 'cancelled' }),
        Queue.countDocuments({ doctor: doc._id, date: today, isEmergency: true, status: { $ne: 'cancelled' } }),
      ]);
      return {
        doctor: doc,
        stats: { waiting, ongoing, completed, cancelled, emergency, total: waiting + ongoing + completed }
      };
    }));

    res.json(monitorData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const getAllTokens = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const queue = await Queue.find({ doctor: req.params.doctorId, date })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .sort({ isEmergency: -1, tokenNumber: 1 });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const cancelToken = async (req, res) => {
  try {
    const token = await Queue.findByIdAndUpdate(
      req.params.tokenId,
      { status: 'cancelled' },
      { new: true }
    );
    if (!token) return res.status(404).json({ message: 'Token not found' });

    const io = req.app.get('io');
    const today = new Date().toISOString().split('T')[0];
    io.to(`queue_${token.doctor}_${today}`).emit('tokenCancelled', token._id);

    res.json({ message: 'Token cancelled successfully', token });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const resetDailyTokens = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await Queue.updateMany(
      { doctor: req.params.doctorId, date: today, status: 'waiting' },
      { status: 'cancelled' }
    );

    const io = req.app.get('io');
    io.to(`queue_${req.params.doctorId}_${today}`).emit('queueReset');

    res.json({ message: 'Daily queue reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}



// ====================Emergency Management===================
export const markEmergency = async (req, res) => {
  try {
    const token = await Queue.findByIdAndUpdate(
      req.params.tokenId,
      { isEmergency: true },
      { new: true }
    )
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    if (!token) return res.status(404).json({ message: 'Token not found' });

    // Notify doctor if they exist
    if (token.doctor?.user?._id) {
      await Notification.create({
        user: token.doctor.user._id,
        title: '🚨 Emergency Patient Approved',
        message: `Admin approved emergency for ${token.patient?.user?.name || 'patient'} — Token #${token.tokenNumber}`,
        type: 'emergency',
      });
    }

    const io = req.app.get('io');
    const today = new Date().toISOString().split('T')[0];
    io.to(`doctor_${token.doctor?._id}`).emit('emergencyAlert', token);
    io.to(`queue_${token.doctor?._id}_${today}`).emit('queueUpdated', token);
    io.to('admin').emit('emergencyAlert', token);

    res.json({ message: 'Emergency approved — patient moved to top', token });
  } catch (err) {
    console.error('Approve emergency error:', err);
    res.status(500).json({ message: err.message });
  }
}


export const removeEmergency = async (req, res) => {
  try {
    const token = await Queue.findByIdAndUpdate(
      req.params.tokenId,
      { isEmergency: false },
      { new: true }
    );
    if (!token) return res.status(404).json({ message: 'Token not found' });

    const io = req.app.get('io');
    const today = new Date().toISOString().split('T')[0];
    io.to(`queue_${token.doctor}_${today}`).emit('queueUpdated', token);

    res.json({ message: 'Emergency status removed successfully', token });
  } catch (err) {
    console.error('Remove emergency error:', err);
    res.status(500).json({ message: err.message });
  }
}


export const getAllEmergencyToken = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const emergencies = await Queue.find({
      date: today,
      isEmergency: true,
      status: { $ne: 'cancelled' },
    })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name email phone' },
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email phone' },
      })
      .sort({ createdAt: -1 });

    res.json(emergencies);
  } catch (err) {
    console.error('Emergency today error:', err);
    res.status(500).json({ message: err.message });
  }
}



// =====================System Settings======================

// In-memory settings store (in production, use a Settings model/collection)
let systemSettings = {
  clinicName: 'MediQueue Hospital',
  clinicPhone: '',
  clinicEmail: '',
  clinicAddress: '',
  defaultMaxPatientsPerDay: 30,
  defaultConsultationTime: 15, // minutes
  workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  workingHoursStart: '09:00',
  workingHoursEnd: '17:00',
  allowEmergencyBooking: true,
  autoResetQueue: true,
  autoResetTime: '00:00',
  notificationsEnabled: true,
  updatedAt: new Date(),
};


export const getSystemSettings =  async (req, res) => {
  try {
    res.json(systemSettings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const updateSystemSettings = async (req, res) => {
  try {
    systemSettings = {
      ...systemSettings,
      ...req.body,
      updatedAt: new Date(),
    };
    res.json({ message: 'Settings updated successfully', settings: systemSettings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const DashboardSummary = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const [totalDoctors, totalPatients, totalUsers, todayTokens, emergencyToday, completedToday, waitingToday] = await Promise.all([
      Doctor.countDocuments(),
      Patient.countDocuments(),
      User.countDocuments(),
      Queue.countDocuments({ date: today }),
      Queue.countDocuments({ date: today, isEmergency: true }),
      Queue.countDocuments({ date: today, status: 'completed' }),
      Queue.countDocuments({ date: today, status: 'waiting' }),
    ]);

    res.json({ totalDoctors, totalPatients, totalUsers, todayTokens, emergencyToday, completedToday, waitingToday });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}