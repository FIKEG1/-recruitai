const mongoose = require('mongoose');

const TrainingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['technical', 'soft_skills', 'leadership', 'compliance', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    durationUnit: {
        type: String,
        enum: ['hours', 'days', 'weeks'],
        default: 'days'
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    provider: {
        type: String
    },
    trainer: {
        type: String
    },
    location: {
        type: String
    },
    maxParticipants: {
        type: Number,
        default: 20
    },
    participants: [{
        employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
        registeredDate: { type: Date, default: Date.now },
        completed: { type: Boolean, default: false },
        completionDate: { type: Date },
        certificate: { type: String },
        feedback: {
            rating: { type: Number, min: 1, max: 5 },
            comment: { type: String }
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'open', 'in_progress', 'completed', 'cancelled'],
        default: 'draft'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Training', TrainingSchema);