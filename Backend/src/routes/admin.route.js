import express from 'express';
const router = express.Router();
import { getUser, userStatus, updateProfile, registerDoctor, updateDoctor, deleteDoctor, allDoctors, getAllTokens, cancelToken, resetDailyTokens, markEmergency, removeEmergency, getAllEmergencyToken, getSystemSettings, updateSystemSettings, DashboardSummary } from '../controllers/admin.controller.js';

import { protect, restrictTo } from '../middlewares/auth.middleware.js';

const adminOnly = [protect, restrictTo('admin')];

// ── User Management ──────────────────────────────────────────────────────────
// Get all users
router.get('/users', ...adminOnly, getUser)

// Toggle user active/inactive status (block / unblock)
router.patch('/users/:id/toggle', ...adminOnly, userStatus)

// Update user profile (admin)
router.put('/users/:id', ...adminOnly, updateProfile)


// ── Doctor Management ─────────────────────────────────────────────────────────
// Create doctor (admin only)
router.post('/doctors', ...adminOnly, registerDoctor)

// Update doctor
router.put('/doctors/:id', ...adminOnly, updateDoctor)

// Delete doctor
router.delete('/doctors/:id', ...adminOnly, deleteDoctor)


// ── Token & Queue Management ──────────────────────────────────────────────────

// Queue monitoring — all doctors
router.get('/queue-monitor', ...adminOnly, allDoctors)

// Get all tokens for a specific doctor (admin view)
router.get('/queue/:doctorId', ...adminOnly, getAllTokens)

// Cancel a specific token (admin)
router.patch('/queue/:tokenId/cancel', ...adminOnly, cancelToken)

// Reset daily tokens for a doctor (admin)
router.post('/queue/reset/:doctorId', ...adminOnly,resetDailyTokens)



// ── Emergency Management ──────────────────────────────────────────────────────

// Approve and mark token as emergency — moves to top of queue
router.patch('/emergency/approve/:tokenId', ...adminOnly, markEmergency)

// Remove emergency status
router.patch('/emergency/remove/:tokenId', ...adminOnly, removeEmergency)

// Get all emergency tokens today
router.get('/emergency/today', ...adminOnly, getAllEmergencyToken)

// ── System Settings ───────────────────────────────────────────────────────────


// Get system settings
router.get('/settings', ...adminOnly, getSystemSettings)

// Update system settings
router.put('/settings', ...adminOnly, updateSystemSettings)



// ── Dashboard Summary ─────────────────────────────────────────────────────────

router.get('/dashboard', ...adminOnly, DashboardSummary)

export default router;