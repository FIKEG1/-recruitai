const express = require('express');
const router = express.Router();
const {
    createTraining,
    getTrainings,
    registerTraining
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/training
// @desc    Create training
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), createTraining);

// @route   GET /api/training
// @desc    Get all training programs
// @access  Private
router.get('/', protect, getTrainings);

// @route   POST /api/training/:id/register
// @desc    Register for training
// @access  Private
router.post('/:id/register', protect, registerTraining);

module.exports = router;