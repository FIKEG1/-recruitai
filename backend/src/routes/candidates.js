const express = require('express');
const router = express.Router();
const { getCandidates } = require('../controllers/candidateController');

// @route   GET /api/candidates
// @desc    Get all candidates
// @access  Public
router.get('/', getCandidates);

module.exports = router;
