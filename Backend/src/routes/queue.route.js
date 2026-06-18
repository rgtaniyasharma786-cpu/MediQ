import express from 'express';
const router = express.Router();
import { bookToken, getQueue, currentToken, callPatient, updateTokenStatus, emergencyEscalate, patientHistory, patientTodayToken, cancelToken, resetDailyToken } from '../controllers/queue.controller.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

// Book a token
router.post('/book', protect, restrictTo('patient'), bookToken)

// Get queue for a doctor (today)
router.get('/doctor/:doctorId', protect, getQueue)

// Get current serving token
router.get('/current/:doctorId', currentToken)

// Call next patient
router.post('/next/:doctorId', protect, restrictTo('doctor'), callPatient)

// Update token status
router.patch('/:tokenId/status', protect, updateTokenStatus)

// Emergency escalate
router.patch('/:tokenId/emergency', protect, restrictTo('admin', 'doctor'), emergencyEscalate)

// Get patient's queue history
router.get('/patient/history', protect, restrictTo('patient'), patientHistory)

// Get patient's today token
router.get('/patient/today', protect, restrictTo('patient'), patientTodayToken)

// Cancel token
router.delete('/:tokenId', protect, cancelToken)

// Reset daily tokens (admin)
router.post('/reset/:doctorId', protect, restrictTo('admin'), resetDailyToken)


export default router;