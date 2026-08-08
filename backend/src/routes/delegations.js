const express = require('express');
const router = express.Router();
const {
    createDelegation,
    getDelegations,
    updateDelegationStatus
} = require('../controllers/delegationController');
const { protect } = require('../middleware/auth');

// @route   POST /api/delegations
// @desc    Create delegation
// @access  Private
router.post('/', protect, createDelegation);

// @route   GET /api/delegations
// @desc    Get all delegations
// @access  Private
router.get('/', protect, getDelegations);

// @route   PUT /api/delegations/:id/status
// @desc    Update delegation status
// @access  Private
router.put('/:id/status', protect, updateDelegationStatus);

module.exports = router;