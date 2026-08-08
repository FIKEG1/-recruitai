const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // ✅ Removed required: true - user can be null
        default: null
    },
    employeeId: {
        type: String,
        unique: true,
        required: true
    },
    personalInfo: {
        title: { type: String, default: '' },
        firstName: { type: String, required: true },
        middleName: { type: String, default: '' },
        lastName: { type: String, required: true },
        dateOfBirth: { type: Date, default: null },
        gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
        maritalStatus: { type: String, default: '' },
        nationality: { type: String, default: '' },
        religion: { type: String, default: '' },
        bloodType: { type: String, default: '' },
        profilePhoto: { type: String, default: '' }
    },
    contactInfo: {
        phone: { type: String, default: '' },
        mobile: { type: String, default: '' },
        email: { type: String, default: '' },
        personalEmail: { type: String, default: '' },
        address: {
            street: { type: String, default: '' },
            city: { type: String, default: '' },
            state: { type: String, default: '' },
            country: { type: String, default: '' },
            postalCode: { type: String, default: '' }
        },
        emergencyContact: {
            name: { type: String, default: '' },
            relationship: { type: String, default: '' },
            phone: { type: String, default: '' },
            mobile: { type: String, default: '' }
        }
    },
    employmentInfo: {
        department: { type: mongoose.Schema.Types.ObjectId, ref: 'Configuration', default: null },
        position: { type: mongoose.Schema.Types.ObjectId, ref: 'Configuration', default: null },
        jobTitle: { type: String, default: '' },
        employmentStatus: { type: String, default: 'active' },
        hireDate: { type: Date, default: Date.now },
        startDate: { type: Date, default: null },
        endDate: { type: Date, default: null },
        terminationReason: { type: String, default: '' },
        terminationDate: { type: Date, default: null },
        supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        workLocation: { type: String, default: '' },
        workSchedule: {
            days: [{ type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] }],
            startTime: { type: String, default: '' },
            endTime: { type: String, default: '' }
        }
    },
    compensation: {
        salary: { type: Number, default: 0 },
        currency: { type: String, default: 'ETB' },
        salaryType: { type: String, enum: ['monthly', 'hourly', 'annual'], default: 'monthly' },
        bankName: { type: String, default: '' },
        bankAccount: { type: String, default: '' },
        taxId: { type: String, default: '' }
    },
    documents: [{
        name: { type: String, default: '' },
        type: { type: String, enum: ['id', 'certificate', 'contract', 'other'], default: 'other' },
        fileUrl: { type: String, default: '' },
        uploadDate: { type: Date, default: Date.now },
        expiryDate: { type: Date, default: null }
    }],
    dependents: [{
        name: { type: String, default: '' },
        relationship: { type: String, default: '' },
        dateOfBirth: { type: Date, default: null },
        gender: { type: String, default: '' },
        isStudent: { type: Boolean, default: false },
        isDisabled: { type: Boolean, default: false }
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'terminated', 'on_leave'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', EmployeeSchema);