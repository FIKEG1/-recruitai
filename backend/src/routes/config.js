const express = require('express');
const router = express.Router();
const {
    getConfigurations,
    updateOrganization,
    addDepartment,
    addPosition,
    addLeaveType,
    addSkill,
    deleteConfigItem
} = require('../controllers/configController');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/config
// @desc    Get all configurations
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), getConfigurations);

// @route   PUT /api/config/organization
// @desc    Update organization info
// @access  Private (Admin)
router.put('/organization', protect, authorize('admin'), updateOrganization);

// @route   POST /api/config/departments
// @desc    Add department
// @access  Private (Admin)
router.post('/departments', protect, authorize('admin'), addDepartment);

// @route   POST /api/config/positions
// @desc    Add position
// @access  Private (Admin)
router.post('/positions', protect, authorize('admin'), addPosition);

// @route   POST /api/config/leave-types
// @desc    Add leave type
// @access  Private (Admin)
router.post('/leave-types', protect, authorize('admin'), addLeaveType);

// @route   POST /api/config/skills
// @desc    Add skill
// @access  Private (Admin)
router.post('/skills', protect, authorize('admin'), addSkill);

// @route   DELETE /api/config/:type/:id
// @desc    Delete configuration item
// @access  Private (Admin)
router.delete('/:type/:id', protect, authorize('admin'), deleteConfigItem);

module.exports = router;