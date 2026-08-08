const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeave = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        
        const leaveData = {
            ...req.body,
            employee: employee._id
        };
        
        const leave = await Leave.create(leaveData);
        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private (Admin)
exports.getLeaves = async (req, res) => {
    try {
        const leaves = await Leave.find()
            .populate('employee', 'employeeId')
            .populate('employee.user', 'name')
            .populate('approvedBy', 'name');
        
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get employee leaves
// @route   GET /api/leaves/me
// @access  Private
exports.getMyLeaves = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }
        
        const leaves = await Leave.find({ employee: employee._id })
            .populate('leaveType', 'name');
        
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin)
exports.updateLeaveStatus = async (req, res) => {
    try {
        const { status, rejectionReason } = req.body;
        const leave = await Leave.findById(req.params.id);
        
        if (!leave) {
            return res.status(404).json({ success: false, message: 'Leave not found' });
        }
        
        leave.status = status;
        if (status === 'approved' || status === 'rejected') {
            leave.approvedBy = req.user.id;
            leave.approvedDate = new Date();
        }
        if (status === 'rejected' && rejectionReason) {
            leave.rejectionReason = rejectionReason;
        }
        
        await leave.save();
        
        res.status(200).json({ success: true, data: leave });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};