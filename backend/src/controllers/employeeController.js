const Employee = require('../models/Employee');
const User = require('../models/User');

// @desc    Create employee
// @route   POST /api/employees
// @access  Private (Admin)
exports.createEmployee = async (req, res) => {
    try {
        console.log('📝 Creating employee with data:', JSON.stringify(req.body, null, 2));
        
        const { personalInfo, contactInfo, employmentInfo, compensation } = req.body;
        
        // Validate required fields
        if (!personalInfo?.firstName || !personalInfo?.lastName) {
            return res.status(400).json({
                success: false,
                message: 'First name and last name are required'
            });
        }
        
        // Generate employee ID
        const count = await Employee.countDocuments();
        const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
        console.log(`📋 Generated Employee ID: ${employeeId}`);
        
        // Create employee data with all fields
        const employeeData = {
            employeeId,
            personalInfo: {
                title: personalInfo?.title || '',
                firstName: personalInfo.firstName,
                middleName: personalInfo?.middleName || '',
                lastName: personalInfo.lastName,
                dateOfBirth: personalInfo?.dateOfBirth || null,
                gender: personalInfo?.gender || 'male',
                maritalStatus: personalInfo?.maritalStatus || '',
                nationality: personalInfo?.nationality || '',
                religion: personalInfo?.religion || '',
                bloodType: personalInfo?.bloodType || '',
                profilePhoto: personalInfo?.profilePhoto || ''
            },
            contactInfo: {
                phone: contactInfo?.phone || '',
                mobile: contactInfo?.mobile || '',
                email: contactInfo?.email || '',
                personalEmail: contactInfo?.personalEmail || '',
                address: {
                    street: contactInfo?.address?.street || '',
                    city: contactInfo?.address?.city || '',
                    state: contactInfo?.address?.state || '',
                    country: contactInfo?.address?.country || '',
                    postalCode: contactInfo?.address?.postalCode || ''
                },
                emergencyContact: {
                    name: contactInfo?.emergencyContact?.name || '',
                    relationship: contactInfo?.emergencyContact?.relationship || '',
                    phone: contactInfo?.emergencyContact?.phone || '',
                    mobile: contactInfo?.emergencyContact?.mobile || ''
                }
            },
            employmentInfo: {
                department: employmentInfo?.department || null,
                position: employmentInfo?.position || null,
                jobTitle: employmentInfo?.jobTitle || '',
                employmentStatus: employmentInfo?.employmentStatus || 'active',
                hireDate: employmentInfo?.hireDate || new Date(),
                startDate: employmentInfo?.startDate || null,
                endDate: employmentInfo?.endDate || null,
                terminationReason: employmentInfo?.terminationReason || '',
                terminationDate: employmentInfo?.terminationDate || null,
                supervisor: employmentInfo?.supervisor || null,
                workLocation: employmentInfo?.workLocation || '',
                workSchedule: {
                    days: employmentInfo?.workSchedule?.days || [],
                    startTime: employmentInfo?.workSchedule?.startTime || '',
                    endTime: employmentInfo?.workSchedule?.endTime || ''
                }
            },
            compensation: {
                salary: compensation?.salary || 0,
                currency: compensation?.currency || 'ETB',
                salaryType: compensation?.salaryType || 'monthly',
                bankName: compensation?.bankName || '',
                bankAccount: compensation?.bankAccount || '',
                taxId: compensation?.taxId || ''
            },
            status: 'active'
        };
        
        console.log('📦 Employee data to save:', JSON.stringify(employeeData, null, 2));
        
        const employee = await Employee.create(employeeData);
        console.log('✅ Employee created successfully:', employee.employeeId);
        
        res.status(201).json({
            success: true,
            data: employee,
            message: 'Employee added successfully'
        });
    } catch (error) {
        console.error('❌ Create Employee Error:', error);
        
        // Check for validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin)
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find()
            .populate('user', 'name email')
            .populate('employmentInfo.department', 'name')
            .populate('employmentInfo.position', 'title');
        
        console.log(`📋 Retrieved ${employees.length} employees`);
        
        res.status(200).json({
            success: true,
            data: employees
        });
    } catch (error) {
        console.error('❌ Get Employees Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
exports.getEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id)
            .populate('user', 'name email')
            .populate('employmentInfo.department', 'name')
            .populate('employmentInfo.position', 'title');
        
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: employee
        });
    } catch (error) {
        console.error('❌ Get Employee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin)
exports.updateEmployee = async (req, res) => {
    try {
        let employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        // Remove _id from update body
        const updateData = { ...req.body };
        delete updateData._id;
        
        employee = await Employee.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        console.log(`✅ Employee updated: ${employee.employeeId}`);
        
        res.status(200).json({
            success: true,
            data: employee,
            message: 'Employee updated successfully'
        });
    } catch (error) {
        console.error('❌ Update Employee Error:', error);
        
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: errors
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin)
exports.deleteEmployee = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'Employee not found'
            });
        }
        
        await employee.deleteOne();
        console.log(`🗑️ Employee deleted: ${employee.employeeId}`);
        
        res.status(200).json({
            success: true,
            message: 'Employee deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete Employee Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};