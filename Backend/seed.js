import mongoose from 'mongoose';
import dotenv from 'dotenv'
dotenv.config();

import User    from './src/models/user.model.js';
import Doctor  from './src/models/doctor.model.js';
import Patient from './src/models/patient.model.js';

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/doctor-queue');
    console.log(' Connected to MongoDB\n');

    // ── Clear only doctors and patients (keep admin intact) ──────────────────
    const doctorUsers   = await Doctor.find().distinct('user');
    const patientUsers  = await Patient.find().distinct('user');

    await Doctor.deleteMany();
    await Patient.deleteMany();
    await User.deleteMany({ _id: { $in: [...doctorUsers, ...patientUsers] } });
    console.log(' Cleared existing doctors and patients\n');

    // ── Sample doctors ────────────────────────────────────────────────────────
    const doctorData = [
      {
        name: 'Dr. Rajesh Kumar',   email: 'rajesh@mediqueue.com',
        phone: '+91 9800000002',    specialization: 'General Medicine',
        fees: 500,  qualification: 'MBBS, MD',   experience: 12, room: 'Room 101',
      },
      {
        name: 'Dr. Priya Sharma',   email: 'priya@mediqueue.com',
        phone: '+91 9800000003',    specialization: 'Cardiology',
        fees: 1200, qualification: 'MBBS, MD, DM', experience: 8, room: 'Room 102',
      },
      {
        name: 'Dr. Amit Singh',     email: 'amit@mediqueue.com',
        phone: '+91 9800000004',    specialization: 'Orthopedics',
        fees: 800,  qualification: 'MBBS, MS',   experience: 15, room: 'Room 103',
      },
      {
        name: 'Dr. Neha Gupta',     email: 'neha@mediqueue.com',
        phone: '+91 9800000005',    specialization: 'Dermatology',
        fees: 700,  qualification: 'MBBS, MD',   experience: 6,  room: 'Room 104',
      },
      {
        name: 'Dr. Suresh Patel',   email: 'suresh@mediqueue.com',
        phone: '+91 9800000006',    specialization: 'Pediatrics',
        fees: 600,  qualification: 'MBBS, DCH',  experience: 10, room: 'Room 105',
      },
    ];

    for (const d of doctorData) {
      const user = await User.create({
        name: d.name, email: d.email,
        password: 'Doctor@123',        // doctors log in with this default password
        role: 'doctor', phone: d.phone,
      });
      await Doctor.create({
        user: user._id,
        specialization: d.specialization,
        fees: d.fees,
        qualification: d.qualification,
        experience: d.experience,
        room: d.room,
        isAvailableToday: true,
        availability: {
          days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          startTime: '09:00',
          endTime: '17:00',
        },
      });
      console.log(`✅ Doctor  : ${d.email}`);
    }

    // ── Sample patient ────────────────────────────────────────────────────────
    const patientUser = await User.create({
      name: 'Rahul Verma', email: 'rahul@mediqueue.com',
      password: 'Patient@123', role: 'patient', phone: '+91 9800000010',
    });
    await Patient.create({
      user: patientUser._id,
      gender: 'Male',
      dateOfBirth: new Date('1990-06-15'),
      bloodGroup: 'O+',
      address: 'Ludhiana, Punjab',
      allergies: ['Penicillin'],
      emergencyContact: { name: 'Ramesh Verma', phone: '+91 9800000011', relation: 'Father' },
    });
    console.log(` Patient : rahul@mediqueue.com`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log('\n Sample data seeded successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  ADMIN LOGIN (auto-created by server on startup)');
    console.log(`  Email   : ${process.env.ADMIN_EMAIL    || 'admin@mediqueue.com'}`);
    console.log(`  Password: ${process.env.ADMIN_PASSWORD || 'Admin@123'}`);
    console.log('');
    console.log('  SAMPLE DOCTOR LOGINS (all share same password)');
    console.log('  Email   : rajesh@mediqueue.com  /  priya@mediqueue.com');
    console.log('            amit@mediqueue.com    /  neha@mediqueue.com');
    console.log('            suresh@mediqueue.com');
    console.log('  Password: Doctor@123');
    console.log('');
    console.log('  SAMPLE PATIENT LOGIN');
    console.log('  Email   : rahul@mediqueue.com');
    console.log('  Password: Patient@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error(' Seed error:', err);
    process.exit(1);
  }
}

seed();
