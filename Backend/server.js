import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './src/models/user.model.js';



// Import Routes
import authRoutes from './src/routes/auth.route.js';
import doctorRoutes from './src/routes/doctors.route.js';
import patientRoutes from './src/routes/patients.route.js';
import queueRoutes from './src/routes/queue.route.js';
import adminRoutes from './src/routes/admin.route.js';
import prescriptionRoutes from './src/routes/prescription.route.js';
import analyticsRoutes from './src/routes/analytics.route.js';


// Import socket.io
import socketHandler from './src/socket/socketHandler.js'

// Fix __dirname in ESH
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));


app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible in routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/analytics', analyticsRoutes);

// Socket.io
 socketHandler(io);

// MongoDB Connection + auto-seed default admin
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-queue')
  .then(async () => {
    console.log('MongoDB Connected');
    await ensureDefaultAdmin();
  })
  .catch(err => console.error('MongoDB Error:', err));

/**
 * Automatically creates the default admin account on first startup.
 * If an admin already exists, this is a no-op.
 * Credentials come from .env (ADMIN_EMAIL / ADMIN_PASSWORD) or safe defaults.
 */
async function ensureDefaultAdmin() {
  try {
    // const User = require('./models/User');

    const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@mediqueue.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName     = process.env.ADMIN_NAME     || 'System Admin';

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log(`Admin already exists: ${existing.email}`);
      return;
    }

    await User.create({
      name:     adminName,
      email:    adminEmail,
      password: adminPassword,   // hashed by pre-save hook in User model
      role:     'admin',
      phone:    process.env.ADMIN_PHONE || '',
      isActive: true,
    });

    console.log('');
    console.log('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Default admin account created!');
    console.log(`   Email   : ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   Change this password after first login!');
    console.log(' ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  } catch (err) {
    console.error('Failed to create default admin:', err.message);
  }
}

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Doctor Queue API Running' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));