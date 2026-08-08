const Complaint = require('../models/Complaint');
const Employee = require('../models/Employee');

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private
exports.createComplaint = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const complaint = await Complaint.create({
            ...req.body,
            employee: employee._id,
            history: [{
                action: 'created',
                note: 'Complaint submitted',
                user: req.user.id
            }]
        });

        res.status(201).json({ success: true, data: complaint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private (Admin)
exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('employee', 'employeeId')
            .populate('employee.user', 'name')
            .populate('assignedTo', 'name')
            .populate('history.user', 'name');

        res.status(200).json({ success: true, data: complaints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get employee complaints
// @route   GET /api/complaints/me
// @access  Private
exports.getMyComplaints = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ success: false, message: 'Employee not found' });
        }

        const complaints = await Complaint.find({ employee: employee._id });
        res.status(200).json({ success: true, data: complaints });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Admin)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, resolution, assignedTo } = req.body;
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ success: false, message: 'Complaint not found' });
        }

        complaint.status = status;
        if (status === 'resolved' && resolution) {
            complaint.resolution = resolution;
            complaint.resolvedDate = new Date();
        }
        if (assignedTo) complaint.assignedTo = assignedTo;

        complaint.history.push({
            action: status,
            note: `Status updated to ${status}${resolution ? ': ' + resolution : ''}`,
            user: req.user.id
        });

        await complaint.save();

        res.status(200).json({ success: true, data: complaint });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};