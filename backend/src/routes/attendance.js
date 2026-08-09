const express = require('express');
const router = express.Router();
const {
    checkIn,
    checkOut,
    getAttendanceReport,
    getMyAttendance,
    getEmployerAttendance,
    getJobSeekerAttendance
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// ============================================
// EMPLOYEE / JOB SEEKER ROUTES
// ============================================

// @route   POST /api/attendance/check-in
// @desc    Check in
// @access  Private
router.post('/check-in', protect, checkIn);

// @route   POST /api/attendance/check-out
// @desc    Check out
// @access  Private
router.post('/check-out', protect, checkOut);

// @route   GET /api/attendance/me
// @desc    Get my attendance (for job seekers/employees)
// @access  Private
router.get('/me', protect, getMyAttendance);

// ============================================
// EMPLOYER ROUTES
// ============================================

// @route   GET /api/attendance/employer
// @desc    Get attendance for employer view
// @access  Private (Employer)
router.get('/employer', protect, authorize('employer'), getEmployerAttendance);

// ============================================
// ADMIN ROUTES
// ============================================

// @route   GET /api/attendance/report
// @desc    Get attendance report (admin only)
// @access  Private (Admin)
router.get('/report', protect, authorize('admin'), getAttendanceReport);
// @route   GET /api/attendance/job-seekers
// @desc    Get all job seekers with attendance status (admin only)
// @access  Private (Admin)
router.get('/job-seekers', protect, authorize('admin'), getJobSeekerAttendance);


module.exports = router;