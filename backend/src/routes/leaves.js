const express = require('express');
const router = express.Router();
const {
    createLeave,
    getLeaves,
    getMyLeaves,
    updateLeaveStatus
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/leaves
// @desc    Create leave request
// @access  Private
router.post('/', protect, createLeave);

// @route   GET /api/leaves
// @desc    Get all leaves
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), getLeaves);

// @route   GET /api/leaves/me
// @desc    Get employee leaves
// @access  Private
router.get('/me', protect, getMyLeaves);

// @route   PUT /api/leaves/:id/status
// @desc    Update leave status
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), updateLeaveStatus);

module.exports = router;