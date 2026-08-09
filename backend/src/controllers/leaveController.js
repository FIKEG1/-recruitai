const Leave = require('../models/Leave');
const Employee = require('../models/Employee');

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
exports.createLeave = async (req, res) => {
    try {
        console.log('=== Create Leave Debug ===');
        console.log('User ID:', req.user.id);
        console.log('User Role:', req.user.role);
        console.log('Leave data:', req.body);
        
        let employee = await Employee.findOne({ user: req.user.id });
        console.log('Employee found:', employee ? 'Yes' : 'No');
        
        if (!employee) {
            console.log('Creating employee record for user');
            // Create employee record if it doesn't exist
            const User = require('../models/User');
            const user = await User.findById(req.user.id);
            
            employee = await Employee.create({
                user: req.user.id,
                employeeId: `EMP${Date.now()}`,
                personalInfo: {
                    firstName: user?.name?.split(' ')[0] || 'User',
                    lastName: user?.name?.split(' ').slice(1).join(' ') || 'Name'
                },
                employmentInfo: {
                    employmentStatus: 'active',
                    hireDate: new Date()
                }
            });
            console.log('Employee record created:', employee._id);
        }
        
        const leaveData = {
            employee: employee._id,
            leaveTypeName: req.body.leaveType,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            totalDays: req.body.totalDays,
            reason: req.body.reason,
            status: 'pending'
        };
        
        const leave = await Leave.create(leaveData);
        console.log('Leave request created:', leave._id);
        
        res.status(201).json({ success: true, data: leave });
    } catch (error) {
        console.error('Create Leave Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all leaves
// @route   GET /api/leaves
// @access  Private (Admin)
exports.getLeaves = async (req, res) => {
    try {
        console.log('=== Get All Leaves Debug ===');
        
        const leaves = await Leave.find()
            .populate('employee', 'employeeId')
            .populate('employee.user', 'name email')
            .populate('approvedBy', 'name')
            .sort({ createdAt: -1 });
        
        console.log('Total leaves found:', leaves.length);
        
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        console.error('Get All Leaves Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get employee leaves
// @route   GET /api/leaves/me
// @access  Private
exports.getMyLeaves = async (req, res) => {
    try {
        console.log('=== Get My Leaves Debug ===');
        console.log('User ID:', req.user.id);
        
        const employee = await Employee.findOne({ user: req.user.id });
        console.log('Employee found:', employee ? 'Yes' : 'No');
        
        if (!employee) {
            console.log('No employee record found, returning empty data');
            return res.status(200).json({
                success: true,
                data: []
            });
        }
        
        const leaves = await Leave.find({ employee: employee._id })
            .sort({ createdAt: -1 });
        
        console.log('Leaves found:', leaves.length);
        
        res.status(200).json({ success: true, data: leaves });
    } catch (error) {
        console.error('Get My Leaves Error:', error);
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