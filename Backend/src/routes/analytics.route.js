import express from 'express';
const router = express.Router();
import { getPatientPerDay, getAverageWaitTime, getStatusDistribution, getPatientBySpecialization } from '../controllers/analytics.controller.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

// Patients per day (last 7 days)
router.get('/patients-per-day', protect, restrictTo('admin'), getPatientPerDay)

// Average wait time
router.get('/avg-wait-time', protect, restrictTo('admin'), getAverageWaitTime)

// Today's status distribution
router.get('/status-distribution', protect, restrictTo('admin'), getStatusDistribution)

// Patients by specialization
router.get('/by-specialization', protect, restrictTo('admin'), getPatientBySpecialization)

export default router;