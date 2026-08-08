const express = require('express');
const router = express.Router();
const {
    createEmployee,
    getEmployees,
    getEmployee,
    updateEmployee,
    deleteEmployee
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/employees
// @desc    Create employee
// @access  Private (Admin)
router.post('/', protect, authorize('admin'), createEmployee);

// @route   GET /api/employees
// @desc    Get all employees
// @access  Private (Admin)
router.get('/', protect, authorize('admin'), getEmployees);

// @route   GET /api/employees/:id
// @desc    Get single employee
// @access  Private
router.get('/:id', protect, getEmployee);

// @route   PUT /api/employees/:id
// @desc    Update employee
// @access  Private (Admin)
router.put('/:id', protect, authorize('admin'), updateEmployee);

// @route   DELETE /api/employees/:id
// @desc    Delete employee
// @access  Private (Admin)
router.delete('/:id', protect, authorize('admin'), deleteEmployee);

module.exports = router;