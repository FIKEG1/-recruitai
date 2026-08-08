const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                message: 'Employee not found' 
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existing = await Attendance.findOne({
            employee: employee._id,
            date: { $gte: today }
        });
        
        if (existing && existing.checkIn.time) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already checked in today' 
            });
        }
        
        const attendance = await Attendance.create({
            employee: employee._id,
            date: new Date(),
            checkIn: {
                time: new Date(),
                method: req.body.method || 'web',
                location: req.body.location
            },
            status: 'present'
        });
        
        res.status(200).json({ 
            success: true, 
            data: attendance,
            message: '✅ Checked in successfully!'
        });
    } catch (error) {
        console.error('Check In Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private
exports.checkOut = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                message: 'Employee not found' 
            });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const attendance = await Attendance.findOne({
            employee: employee._id,
            date: { $gte: today }
        });
        
        if (!attendance) {
            return res.status(404).json({ 
                success: false, 
                message: 'No check-in found for today' 
            });
        }
        
        if (attendance.checkOut.time) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already checked out' 
            });
        }
        
        attendance.checkOut = {
            time: new Date(),
            method: req.body.method || 'web',
            location: req.body.location
        };
        
        // Calculate hours worked
        const start = new Date(attendance.checkIn.time);
        const end = new Date(attendance.checkOut.time);
        const diff = (end - start) / (1000 * 60 * 60);
        attendance.hoursWorked = Math.round(diff * 10) / 10;
        
        await attendance.save();
        
        res.status(200).json({ 
            success: true, 
            data: attendance,
            message: '✅ Checked out successfully!'
        });
    } catch (error) {
        console.error('Check Out Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};

// ============================================
// NEW: GET MY ATTENDANCE (FOR JOB SEEKERS)
// ============================================
// @desc    Get my attendance (for job seekers/employees)
// @route   GET /api/attendance/me
// @access  Private
exports.getMyAttendance = async (req, res) => {
    try {
        const employee = await Employee.findOne({ user: req.user.id });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee record not found. Please contact HR.'
            });
        }

        const { startDate, endDate } = req.query;
        const query = { employee: employee._id };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const attendances = await Attendance.find(query)
            .sort({ date: -1 });

        // Calculate stats
        const stats = {
            present: attendances.filter(a => a.status === 'present').length,
            absent: attendances.filter(a => a.status === 'absent').length,
            late: attendances.filter(a => a.status === 'late').length,
            leave: attendances.filter(a => a.status === 'leave' || a.status === 'holiday').length,
            total: attendances.length
        };

        // Get today's status
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRecord = attendances.find(a => {
            const date = new Date(a.date);
            date.setHours(0, 0, 0, 0);
            return date.getTime() === today.getTime();
        });

        res.status(200).json({
            success: true,
            data: attendances,
            stats: stats,
            today: {
                checkedIn: !!todayRecord?.checkIn?.time,
                checkedOut: !!todayRecord?.checkOut?.time,
                status: todayRecord?.status || 'not_started',
                record: todayRecord || null
            }
        });
    } catch (error) {
        console.error('Get My Attendance Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get attendance report (admin only)
// @route   GET /api/attendance/report
// @access  Private (Admin)
exports.getAttendanceReport = async (req, res) => {
    try {
        const { startDate, endDate, employeeId } = req.query;
        
        const query = {};
        if (employeeId) query.employee = employeeId;
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const attendances = await Attendance.find(query)
            .populate('employee', 'employeeId')
            .populate('employee.user', 'name')
            .populate('employee.personalInfo', 'firstName lastName');
        
        // Calculate stats
        const stats = {
            present: attendances.filter(a => a.status === 'present').length,
            absent: attendances.filter(a => a.status === 'absent').length,
            late: attendances.filter(a => a.status === 'late').length,
            leave: attendances.filter(a => a.status === 'leave' || a.status === 'holiday').length,
            total: attendances.length
        };
        
        res.status(200).json({ 
            success: true, 
            data: attendances,
            stats: stats
        });
    } catch (error) {
        console.error('Get Attendance Report Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};