const express = require('express');
const router = express.Router();
const {
    createComplaint,
    getComplaints,
    getMyComplaints,
    updateComplaintStatus
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/complaints
// @desc    Create complaint
// @access  Private
router.post('/', protect, createComplaint);

// @route   GET /api/complaints
// @desc    Get all complaints
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), getComplaints);

// @route   GET /api/complaints/me
// @desc    Get employee complaints
// @access  Private
router.get('/me', protect, getMyComplaints);

// @route   PUT /api/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Admin)
router.put('/:id/status', protect, authorize('admin'), updateComplaintStatus);

module.exports = router;