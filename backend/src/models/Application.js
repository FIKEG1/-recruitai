const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    resume: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume'
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'rejected'],
        default: 'pending'
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    coverLetter: String,
    notes: String,
    interviewDate: Date,
    interviewLocation: String,
    statusHistory: [{
        status: String,
        date: {
            type: Date,
            default: Date.now
        },
        note: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Application', ApplicationSchema);
