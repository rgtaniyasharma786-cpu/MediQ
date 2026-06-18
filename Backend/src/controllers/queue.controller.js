import Queue from '../models/queue.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';
import Notification from '../models/notification.model.js';


export const bookToken = async (req, res) => {
  try {
    const { doctorId, problemDescription, symptoms, isEmergency } = req.body;
    const today = new Date().toISOString().split('T')[0];

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!doctor.isAvailableToday) return res.status(400).json({ message: 'Doctor not available today' });

    // Check if patient already booked today
    const existing = await Queue.findOne({ patient: patient._id, doctor: doctorId, date: today, status: { $ne: 'cancelled' } });
    if (existing) return res.status(400).json({ message: 'You already have a token for this doctor today' });

    // Count today's tokens
    const todayCount = await Queue.countDocuments({ doctor: doctorId, date: today, status: { $ne: 'cancelled' } });
    if (todayCount >= doctor.maxPatientsPerDay) return res.status(400).json({ message: 'Doctor queue is full for today' });

    // Get next token number
    const lastToken = await Queue.findOne({ doctor: doctorId, date: today }).sort('-tokenNumber');
    const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;

    const avgWaitPerPatient = 15; // minutes
    const waitingAhead = await Queue.countDocuments({ doctor: doctorId, date: today, status: 'waiting' });
    const estimatedWaitTime = waitingAhead * avgWaitPerPatient;

    const queue = await Queue.create({
      doctor: doctorId,
      patient: patient._id,
      tokenNumber,
      date: today,
      isEmergency: isEmergency || false,
      problemDescription,
      symptoms: symptoms || [],
      estimatedWaitTime,
    });

    await queue.populate([
      { path: 'doctor', populate: { path: 'user', select: 'name' } },
      { path: 'patient', populate: { path: 'user', select: 'name email' } }
    ]);

    // Notify doctor
    await Notification.create({
      user: doctor.user,
      title: isEmergency ? '🚨 Emergency Patient' : 'New Patient Booked',
      message: `${req.user.name} booked token #${tokenNumber}${isEmergency ? ' (EMERGENCY)' : ''}`,
      type: isEmergency ? 'emergency' : 'info',
    });

    // Emit socket event
    const io = req.app.get('io');
    io.to(`doctor_${doctorId}`).emit('newPatient', queue);
    io.to(`queue_${doctorId}_${today}`).emit('queueUpdated', queue);

    res.status(201).json(queue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getQueue = async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const queue = await Queue.find({ doctor: req.params.doctorId, date })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone avatar' } })
      .sort({ isEmergency: -1, tokenNumber: 1 });
    res.json(queue);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const currentToken = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const current = await Queue.findOne({ doctor: req.params.doctorId, date: today, status: 'ongoing' })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name' } });
    const waiting = await Queue.countDocuments({ doctor: req.params.doctorId, date: today, status: 'waiting' });
    res.json({ current, waitingCount: waiting });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const callPatient = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const doctorId = req.params.doctorId;

    // Complete current ongoing
    await Queue.findOneAndUpdate(
      { doctor: doctorId, date: today, status: 'ongoing' },
      { status: 'completed', completedAt: new Date() }
    );

    // Get next patient (emergency first, then by token)
    const nextPatient = await Queue.findOne({ doctor: doctorId, date: today, status: 'waiting' })
      .sort({ isEmergency: -1, tokenNumber: 1 })
      .populate({ path: 'patient', populate: { path: 'user', select: 'name email phone' } });

    if (!nextPatient) {
      const io = req.app.get('io');
      io.to(`doctor_${doctorId}`).emit('queueEmpty');
      return res.json({ message: 'No more patients in queue', nextPatient: null });
    }

    nextPatient.status = 'ongoing';
    nextPatient.calledAt = new Date();
    await nextPatient.save();

    // Notify patient
    await Notification.create({
      user: nextPatient.patient.user._id,
      title: 'Your Turn!',
      message: `Token #${nextPatient.tokenNumber} - Please proceed to the doctor's room`,
      type: 'success',
    });

    const io = req.app.get('io');
    io.to(`doctor_${doctorId}`).emit('tokenCalled', nextPatient);
    io.to(`queue_${doctorId}_${today}`).emit('tokenCalled', nextPatient);
    io.to(`patient_${nextPatient.patient._id}`).emit('yourTurn', nextPatient);

    res.json(nextPatient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const updateTokenStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const token = await Queue.findByIdAndUpdate(
      req.params.tokenId,
      { status, notes, ...(status === 'completed' ? { completedAt: new Date() } : {}) },
      { new: true }
    ).populate({ path: 'patient', populate: { path: 'user', select: 'name email' } });

    const io = req.app.get('io');
    const today = new Date().toISOString().split('T')[0];
    io.to(`queue_${token.doctor}_${today}`).emit('statusUpdated', token);

    res.json(token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const emergencyEscalate = async (req, res) => {
  try {
    const token = await Queue.findByIdAndUpdate(
      req.params.tokenId,
      { isEmergency: true },
      { new: true }
    ).populate({ path: 'patient', populate: { path: 'user', select: 'name' } });

    const io = req.app.get('io');
    const today = new Date().toISOString().split('T')[0];
    io.to(`doctor_${token.doctor}`).emit('emergencyAlert', token);
    io.to(`queue_${token.doctor}_${today}`).emit('queueUpdated', token);

    res.json(token);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const patientHistory = async (req, res) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

    const history = await Queue.find({ patient: patient._id })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } })
      .populate('prescription')
      .sort('-createdAt')
      .limit(20);

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const patientTodayToken = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });

    const tokens = await Queue.find({ patient: patient._id, date: today })
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name avatar' } });

    res.json(tokens);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const cancelToken = async (req, res) => {
  try {
    const token = await Queue.findById(req.params.tokenId);
    if (!token) return res.status(404).json({ message: 'Token not found' });

    token.status = 'cancelled';
    await token.save();

    const io = req.app.get('io');
    const today = new Date().toISOString().split('T')[0];
    io.to(`queue_${token.doctor}_${today}`).emit('tokenCancelled', token._id);

    res.json({ message: 'Token cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const resetDailyToken = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    await Queue.updateMany(
      { doctor: req.params.doctorId, date: today, status: 'waiting' },
      { status: 'cancelled' }
    );
    res.json({ message: 'Queue reset successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}