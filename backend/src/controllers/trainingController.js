const Training = require('../models/Training');
const Employee = require('../models/Employee');

// @desc    Create training
// @route   POST /api/training
// @access  Private (Admin)
exports.createTraining = async (req, res) => {
    try {
        const training = await Training.create(req.body);
        res.status(201).json({ success: true, data: training });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all training programs
// @route   GET /api/training
// @access  Private
exports.getTrainings = async (req, res) => {
    try {
        const trainings = await Training.find().populate('participants.employee', 'employeeId');
        res.status(200).json({ success: true, data: trainings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Register for training
// @route   POST /api/training/:id/register
// @access  Private
exports.registerTraining = async (req, res) => {
    try {
        const training = await Training.findById(req.params.id);
        if (!training) {
            return res.status(404).json({ success: false, message: 'Training not found' });
        }
        
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        
        // Check if already registered
        if (training.participants.some(p => p.employee.toString() === employee._id.toString())) {
            return res.status(400).json({ success: false, message: 'Already registered' });
        }
        
        training.participants.push({ employee: employee._id });
        await training.save();
        
        res.status(200).json({ success: true, data: training });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};