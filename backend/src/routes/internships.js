const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    createInternship,
    getInternships,
    getInternship,
    updateInternship,
    deleteInternship,
    applyInternship
} = require('../controllers/internshipController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/internships
// @desc    Create an internship
// @access  Private (Employer)
router.post('/', [
    protect,
    authorize('employer', 'admin'),
    body('title').notEmpty().withMessage('Title is required'),
    body('department').notEmpty().withMessage('Department is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('applicationDeadline').isDate().withMessage('Application deadline is required')
], createInternship);

// @route   GET /api/internships
// @desc    Get all internships
// @access  Public
router.get('/', getInternships);

// @route   GET /api/internships/:id
// @desc    Get single internship
// @access  Public
router.get('/:id', getInternship);

// @route   PUT /api/internships/:id
// @desc    Update internship
// @access  Private (Employer)
router.put('/:id', protect, authorize('employer', 'admin'), updateInternship);

// @route   DELETE /api/internships/:id
// @desc    Delete internship
// @access  Private (Employer)
router.delete('/:id', protect, authorize('employer', 'admin'), deleteInternship);

// @route   POST /api/internships/:id/apply
// @desc    Apply for internship
// @access  Private (Job Seeker)
router.post('/:id/apply', [
    protect,
    authorize('jobseeker'),
    body('resumeId').notEmpty().withMessage('Resume ID is required')
], applyInternship);

module.exports = router;