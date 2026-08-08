const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['harassment', 'discrimination', 'work_environment', 'salary', 'benefits', 'management', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'investigating', 'resolved', 'rejected'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    resolution: {
        type: String
    },
    resolvedDate: {
        type: Date
    },
    attachments: [{
        name: String,
        url: String
    }],
    history: [{
        action: String,
        note: String,
        date: { type: Date, default: Date.now },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', ComplaintSchema);