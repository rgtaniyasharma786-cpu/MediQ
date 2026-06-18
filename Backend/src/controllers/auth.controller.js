import jwt from 'jsonwebtoken';
import User from  '../models/user.model.js';
import Patient from '../models/patient.model.js';
import Doctor from '../models/doctor.model.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });


export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, phone, gender, dateOfBirth } = req.body;

    // ✅ Hard-block: only 'patient' role is allowed through public registration
    // Doctors must be added by admin via /api/admin/doctors
    const role = 'patient';

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    // Create user account
    const user = await User.create({ name, email, password, role, phone });

    // Create matching patient profile
    await Patient.create({ user: user._id, gender, dateOfBirth });

    // ✅ Do NOT return a token — patient must log in manually after registration
    res.status(201).json({
      message: 'Account created successfully. Please sign in.',
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.isActive) return res.status(403).json({ message: 'Account deactivated' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    let profile = null;

    if (user.role === 'doctor') {
      profile = await Doctor.findOne({ user: user._id });
    } else if (user.role === 'patient') {
      profile = await Patient.findOne({ user: user._id });
    }

    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


export const updateProfile =  async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}