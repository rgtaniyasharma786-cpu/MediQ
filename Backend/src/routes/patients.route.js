import express from 'express';
const router = express.Router();
import { patientProfile, updateProfile, getNotification, markRead, markAllRead } from '../controllers/patients.controller.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

// Get patient profile
router.get('/profile', protect, restrictTo('patient'), patientProfile)

// Update patient profile
router.put('/profile', protect, restrictTo('patient'), updateProfile)

// Get notifications
router.get('/notifications', protect, getNotification)

// Mark notification read
router.patch('/notifications/:id/read', protect, markRead)

// Mark all notifications read
router.patch('/notifications/read-all', protect, markAllRead)

export default router;