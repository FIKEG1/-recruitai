const express = require('express');
const router = express.Router();
const {
    getConfigurations,
    updateOrganization,
    addDepartment,
    addPosition,
    addLeaveType,
    addSkill,
    addJobTitle,
    addLanguage,
    addLicense,
    addReligion,
    addEmploymentStatus,
    addEducationLevel,
    addMaritalStatus,
    addTrainingType,
    addTerminationReason,
    addDeductionType,
    addNation,
    addTitle,
    addBloodType,
    addPartner,
    addPositionRank,
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

// Organization Structure
router.post('/departments', protect, authorize('admin'), addDepartment);
router.post('/positions', protect, authorize('admin'), addPosition);
router.post('/position-ranks', protect, authorize('admin'), addPositionRank);
router.post('/job-titles', protect, authorize('admin'), addJobTitle);

// Skills & Qualifications
router.post('/skills', protect, authorize('admin'), addSkill);
router.post('/languages', protect, authorize('admin'), addLanguage);
router.post('/licenses', protect, authorize('admin'), addLicense);
router.post('/education-levels', protect, authorize('admin'), addEducationLevel);

// Personal Information
router.post('/religions', protect, authorize('admin'), addReligion);
router.post('/marital-status', protect, authorize('admin'), addMaritalStatus);
router.post('/nations', protect, authorize('admin'), addNation);
router.post('/titles', protect, authorize('admin'), addTitle);
router.post('/blood-types', protect, authorize('admin'), addBloodType);

// Employment
router.post('/employment-status', protect, authorize('admin'), addEmploymentStatus);
router.post('/training-types', protect, authorize('admin'), addTrainingType);
router.post('/leave-types', protect, authorize('admin'), addLeaveType);
router.post('/termination-reasons', protect, authorize('admin'), addTerminationReason);
router.post('/deduction-types', protect, authorize('admin'), addDeductionType);

// Partners
router.post('/partners', protect, authorize('admin'), addPartner);

// @route   DELETE /api/config/:type/:id
// @desc    Delete configuration item
// @access  Private (Admin)
router.delete('/:type/:id', protect, authorize('admin'), deleteConfigItem);

module.exports = router;