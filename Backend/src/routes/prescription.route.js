import express from 'express';
const router = express.Router();
import { patientPrescription, issuedPrescription, createPrescription, prescriptionById } from '../controllers/prescription.controller.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

// ✅ IMPORTANT: Static routes MUST come before /:id dynamic route
// Otherwise Express matches 'patient' and 'doctor' as :id values

// Get patient's prescriptions — /prescriptions/patient/history
router.get('/patient/history', protect, restrictTo('patient'), patientPrescription)

// Get doctor's issued prescriptions — /prescriptions/doctor/issued
router.get('/doctor/issued', protect, restrictTo('doctor'), issuedPrescription)

// Create prescription
router.post('/', protect, restrictTo('doctor'), createPrescription)

// Get prescription by ID — /:id must come LAST
router.get('/:id', protect, prescriptionById)

export default router;