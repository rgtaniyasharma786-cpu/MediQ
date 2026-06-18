import express from 'express';
const router = express.Router();
import { getDoctors, getDoctorProfile, updateDoctorProfile, toggleAvailability, queueStats, singleDoctor } from '../controllers/doctors.controller.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

// Get all doctors (public)
router.get('/',getDoctors)

// ✅ Static routes MUST come before /:id to avoid being swallowed
// Get doctor profile (for logged in doctor)
router.get('/profile/me', protect, restrictTo('doctor'), getDoctorProfile)

// Update doctor profile
router.put('/profile/update', protect, restrictTo('doctor'), updateDoctorProfile)

// Toggle availability
router.patch('/availability', protect, restrictTo('doctor'), toggleAvailability)

// Get doctor's today queue stats
router.get('/:id/stats', protect,queueStats)

// Get single doctor — keep /:id LAST among GET routes
router.get('/:id', singleDoctor)


export default router;