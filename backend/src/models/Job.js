const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Please add a department']
    },
    description: {
        type: String,
        required: [true, 'Please add a job description']
    },
    requirements: {
        education: String,
        experience: String,
        skills: [String],
        qualifications: [String]
    },
    employmentType: {
        type: String,
        enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship'],
        default: 'Full-Time'
    },
    // ============================================
    // INTERNSHIP SPECIFIC FIELDS (NEW)
    // ============================================
    isInternship: {
        type: Boolean,
        default: false
    },
    internshipType: {
        type: String,
        enum: ['Paid', 'Unpaid', 'Stipend', 'Credit'],
        default: 'Unpaid'
    },
    internshipDuration: {
        type: String,
        enum: ['3 Months', '6 Months', '9 Months', '12 Months', 'Flexible'],
        default: '6 Months'
    },
    internshipStartDate: {
        type: Date,
        default: null
    },
    internshipEndDate: {
        type: Date,
        default: null
    },
    numberOfPositions: {
        type: Number,
        default: 1,
        min: 1
    },
    // ============================================
    // ACADEMIC REQUIREMENTS (NEW)
    // ============================================
    academicRequirements: {
        fieldOfStudy: {
            type: [String],
            default: []
        },
        minimumGPA: {
            type: Number,
            min: 0,
            max: 4,
            default: 0
        },
        yearOfStudy: {
            type: String,
            enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Graduate', 'Any'],
            default: 'Any'
        },
        university: {
            type: String,
            default: ''
        }
    },
    // ============================================
    // BENEFITS (NEW)
    // ============================================
    benefits: {
        type: [String],
        default: []
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'ETB'
        }
    },
    applicationDeadline: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'closed', 'draft'],
        default: 'open'
    },
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }],
    viewCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for internship searches
JobSchema.index({ isInternship: 1, employmentType: 1 });
JobSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Job', JobSchema);