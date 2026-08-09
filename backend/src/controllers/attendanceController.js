const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
exports.checkIn = async (req, res) => {
    try {
        console.log('=== Check In Debug ===');
        console.log('User ID:', req.user.id);
        console.log('User Role:', req.user.role);
        
        const employee = await Employee.findOne({ user: req.user.id });
        console.log('Employee found:', employee ? 'Yes' : 'No');
        
        if (!employee) {
            console.log('Creating employee record for user');
            // Create employee record if it doesn't exist
            const newEmployee = await Employee.create({
                user: req.user.id,
                employeeId: `EMP${Date.now()}`,
                personalInfo: {
                    firstName: req.user.name?.split(' ')[0] || 'User',
                    lastName: req.user.name?.split(' ').slice(1).join(' ') || 'Name'
                },
                employmentInfo: {
                    employmentStatus: 'active',
                    hireDate: new Date()
                }
            });
            console.log('Employee record created:', newEmployee._id);
        }
        
        const employeeRecord = employee || await Employee.findOne({ user: req.user.id });
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const existing = await Attendance.findOne({
            employee: employeeRecord._id,
            date: { $gte: today }
        });
        
        if (existing && existing.checkIn.time) {
            return res.status(400).json({ 
                success: false, 
                message: 'Already checked in today' 
            });
        }
        
        const attendance = await Attendance.create({
            employee: employeeRecord._id,
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
        console.log('=== Check Out Debug ===');
        console.log('User ID:', req.user.id);
        
        const employee = await Employee.findOne({ user: req.user.id });
        console.log('Employee found:', employee ? 'Yes' : 'No');
        
        if (!employee) {
            return res.status(404).json({ 
                success: false, 
                message: 'Employee not found. Please check in first.' 
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
        console.log('=== Get My Attendance Debug ===');
        console.log('User ID:', req.user.id);
        console.log('User Role:', req.user.role);
        
        const employee = await Employee.findOne({ user: req.user.id });
        console.log('Employee found:', employee ? 'Yes' : 'No');
        
        if (!employee) {
            console.log('No employee record found, returning empty data');
            return res.status(200).json({
                success: true,
                data: [],
                stats: {
                    present: 0,
                    absent: 0,
                    late: 0,
                    leave: 0,
                    total: 0
                },
                today: {
                    checkedIn: false,
                    checkedOut: false,
                    status: 'not_started',
                    record: null
                }
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

        console.log('Attendance records found:', attendances.length);

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

        console.log('Today record:', todayRecord ? 'Found' : 'Not found');

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

// @desc    Get all job seekers with attendance status (admin only)
// @route   GET /api/attendance/job-seekers
// @access  Private (Admin)
exports.getJobSeekerAttendance = async (req, res) => {
    try {
        console.log('=== Get Job Seeker Attendance ===');
        
        const User = require('../models/User');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get all job seekers
        const jobSeekers = await User.find({ role: 'jobseeker' })
            .select('name email profile createdAt')
            .sort({ createdAt: -1 });
        
        console.log('Job seekers found:', jobSeekers.length);
        
        // Get attendance for each job seeker
        const jobSeekersWithAttendance = await Promise.all(
            jobSeekers.map(async (jobSeeker) => {
                const employee = await Employee.findOne({ user: jobSeeker._id });
                
                if (!employee) {
                    return {
                        _id: jobSeeker._id,
                        name: jobSeeker.name,
                        email: jobSeeker.email,
                        hasEmployeeRecord: false,
                        todayStatus: {
                            checkedIn: false,
                            checkedOut: false,
                            status: 'not_started'
                        },
                        stats: {
                            present: 0,
                            absent: 0,
                            late: 0,
                            leave: 0,
                            total: 0
                        }
                    };
                }
                
                // Get today's attendance
                const todayAttendance = await Attendance.findOne({
                    employee: employee._id,
                    date: { $gte: today }
                });
                
                // Get all attendance for stats
                const allAttendance = await Attendance.find({ employee: employee._id });
                
                return {
                    _id: jobSeeker._id,
                    name: jobSeeker.name,
                    email: jobSeeker.email,
                    employeeId: employee.employeeId,
                    hasEmployeeRecord: true,
                    todayStatus: {
                        checkedIn: !!todayAttendance?.checkIn?.time,
                        checkedOut: !!todayAttendance?.checkOut?.time,
                        status: todayAttendance?.status || 'not_started',
                        checkInTime: todayAttendance?.checkIn?.time || null,
                        checkOutTime: todayAttendance?.checkOut?.time || null
                    },
                    stats: {
                        present: allAttendance.filter(a => a.status === 'present').length,
                        absent: allAttendance.filter(a => a.status === 'absent').length,
                        late: allAttendance.filter(a => a.status === 'late').length,
                        leave: allAttendance.filter(a => a.status === 'leave' || a.status === 'holiday').length,
                        total: allAttendance.length
                    }
                };
            })
        );
        
        // Calculate overall stats
        const overallStats = {
            totalJobSeekers: jobSeekers.length,
            withEmployeeRecords: jobSeekersWithAttendance.filter(js => js.hasEmployeeRecord).length,
            checkedInToday: jobSeekersWithAttendance.filter(js => js.todayStatus.checkedIn).length,
            checkedOutToday: jobSeekersWithAttendance.filter(js => js.todayStatus.checkedOut).length,
            totalPresent: jobSeekersWithAttendance.reduce((sum, js) => sum + js.stats.present, 0),
            totalAbsent: jobSeekersWithAttendance.reduce((sum, js) => sum + js.stats.absent, 0),
            totalLate: jobSeekersWithAttendance.reduce((sum, js) => sum + js.stats.late, 0)
        };
        
        console.log('Overall stats:', overallStats);
        
        res.status(200).json({
            success: true,
            data: jobSeekersWithAttendance,
            stats: overallStats
        });
    } catch (error) {
        console.error('Get Job Seeker Attendance Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get attendance for employer view
// @route   GET /api/attendance/employer
// @access  Private (Employer)
exports.getEmployerAttendance = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        console.log('=== Employer Attendance Debug ===');
        console.log('User ID:', req.user.id);
        console.log('User Role:', req.user.role);
        console.log('Filters:', { startDate, endDate });
        
        const query = {};
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const attendances = await Attendance.find(query)
            .populate('employee', 'employeeId')
            .populate('employee.user', 'name email')
            .populate('employee.personalInfo', 'firstName lastName')
            .sort({ date: -1 });
        
        console.log('Total attendance records found:', attendances.length);
        
        // Calculate stats
        const stats = {
            present: attendances.filter(a => a.status === 'present').length,
            absent: attendances.filter(a => a.status === 'absent').length,
            late: attendances.filter(a => a.status === 'late').length,
            leave: attendances.filter(a => a.status === 'leave' || a.status === 'holiday').length,
            total: attendances.length
        };
        
        // Get today's attendance count
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAttendances = attendances.filter(a => {
            const date = new Date(a.date);
            date.setHours(0, 0, 0, 0);
            return date.getTime() === today.getTime();
        });
        
        console.log('Stats:', stats);
        console.log('Today stats:', {
            total: todayAttendances.length,
            present: todayAttendances.filter(a => a.status === 'present').length,
            absent: todayAttendances.filter(a => a.status === 'absent').length,
            late: todayAttendances.filter(a => a.status === 'late').length
        });
        
        res.status(200).json({ 
            success: true, 
            data: attendances,
            stats: stats,
            today: {
                total: todayAttendances.length,
                present: todayAttendances.filter(a => a.status === 'present').length,
                absent: todayAttendances.filter(a => a.status === 'absent').length,
                late: todayAttendances.filter(a => a.status === 'late').length
            }
        });
    } catch (error) {
        console.error('Get Employer Attendance Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
};