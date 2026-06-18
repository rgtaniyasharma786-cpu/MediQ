import express from 'express';
const router = express.Router();
import { registerPatient, login, getCurrentUser, updateProfile } from '../controllers/auth.controller.js';

import { protect } from '../middlewares/auth.middleware.js';

// Register — patients only via public endpoint
// Doctors and admins are created exclusively by the admin panel
router.post('/register', registerPatient)

// Login
router.post('/login', login)

// Get current user
router.get('/me', protect, getCurrentUser)

// Update profile
router.put('/profile', protect, updateProfile)

export default router;