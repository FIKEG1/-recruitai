const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
    createJob, 
    getJobs, 
    getJob, 
    updateJob, 
    deleteJob,
    getMatchingCandidates,
    getEmployerJobs,
    toggleSaveJob
} = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/jobs
// @desc    Create a job
// @access  Private (Employer/Admin)
router.post('/', [
    protect,
    authorize('employer', 'admin'),
    body('title').notEmpty().withMessage('Job title is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('description').notEmpty().withMessage('Job description is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('applicationDeadline').isDate().withMessage('Application deadline is required')
], createJob);

// @route   GET /api/jobs
// @desc    Get all jobs
// @access  Public
router.get('/', getJobs);

// @route   GET /api/jobs/employer/me
// @desc    Get employer's jobs
// @access  Private (Employer)
router.get('/employer/me', protect, authorize('employer'), getEmployerJobs);

// @route   GET /api/jobs/:id
// @desc    Get single job
// @access  Public
router.get('/:id', getJob);

// @route   GET /api/jobs/:id/matches
// @desc    Get matching candidates for a job
// @access  Private (Employer/Admin)
router.get('/:id/matches', protect, authorize('employer', 'admin'), getMatchingCandidates);

// @route   POST /api/jobs/:id/save
// @desc    Toggle Save/Bookmark Job
// @access  Private (Jobseeker)
router.post('/:id/save', protect, authorize('jobseeker'), toggleSaveJob);

// @route   PUT /api/jobs/:id
// @desc    Update job
// @access  Private (Employer/Admin)
router.put('/:id', protect, authorize('employer', 'admin'), updateJob);

// @route   DELETE /api/jobs/:id
// @desc    Delete job
// @access  Private (Employer/Admin)
router.delete('/:id', protect, authorize('employer', 'admin'), deleteJob);

module.exports = router;