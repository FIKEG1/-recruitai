const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['jobseeker', 'employer', 'admin'],
        default: 'jobseeker'
    },
    profile: {
        phone: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        },
        bio: {
            type: String,
            default: ''
        },
        title: {
            type: String,
            default: ''
        },
        availabilityStatus: {
            type: String,
            enum: ['Available now', 'Busy', 'Available part-time', 'Not available'],
            default: 'Available now'
        },
        expectedSalary: {
            amount: { type: Number, default: 0 },
            currency: { type: String, default: 'ETB' },
            rateType: { type: String, enum: ['Hourly', 'Fixed', 'Monthly'], default: 'Hourly' }
        },
        successRate: {
            type: Number,
            default: 100 // mock initial percentage
        },
        rating: {
            score: { type: Number, default: 0 },
            reviews: { type: Number, default: 0 }
        },
        savedJobs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job'
        }],
        profilePhoto: {
            type: String,
            default: null
        },
        skills: {
            type: [String],
            default: []
        },
        certifications: {
            type: [String],
            default: []
        },
        languages: {
            type: [String],
            default: []
        },
        education: [{
            institution: {
                type: String,
                default: ''
            },
            degree: {
                type: String,
                default: ''
            },
            field: {
                type: String,
                default: ''
            },
            graduationYear: {
                type: Number,
                default: null
            }
        }],
        workExperience: [{
            company: {
                type: String,
                default: ''
            },
            position: {
                type: String,
                default: ''
            },
            startDate: {
                type: Date,
                default: null
            },
            endDate: {
                type: Date,
                default: null
            },
            description: {
                type: String,
                default: ''
            },
            currentlyWorking: {
                type: Boolean,
                default: false
            }
        }]
    },
    company: {
        name: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
        website: {
            type: String,
            default: ''
        },
        location: {
            type: String,
            default: ''
        }
    },
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpire: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);