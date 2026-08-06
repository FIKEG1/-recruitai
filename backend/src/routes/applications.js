const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
    applyJob, 
    getJobApplications, 
    getMyApplications, 
    updateApplicationStatus,
    scheduleInterview
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/applications
// @desc    Apply for a job
// @access  Private (Job Seeker)
router.post('/', [
    protect,
    authorize('jobseeker'),
    body('jobId').notEmpty().withMessage('Job ID is required'),
    body('resumeId').notEmpty().withMessage('Resume ID is required')
], applyJob);

// @route   GET /api/applications/me
// @desc    Get user's applications
// @access  Private (Job Seeker)
router.get('/me', protect, authorize('jobseeker'), getMyApplications);

// @route   GET /api/applications/job/:jobId
// @desc    Get all applications for a job
// @access  Private (Employer/Admin)
router.get('/job/:jobId', protect, authorize('employer', 'admin'), getJobApplications);

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Employer/Admin)
router.put('/:id/status', [
    protect,
    authorize('employer', 'admin'),
    body('status').isIn(['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected'])
        .withMessage('Invalid status')
], updateApplicationStatus);

// @route   PUT /api/applications/:id/schedule-interview
// @desc    Schedule interview
// @access  Private (Employer/Admin)
router.put('/:id/schedule-interview', [
    protect,
    authorize('employer', 'admin'),
    body('interviewDate').isDate().withMessage('Interview date is required')
], scheduleInterview);

module.exports = router;