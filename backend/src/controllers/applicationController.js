const Application = require('../models/Application');
const Job = require('../models/Job');
const Resume = require('../models/Resume');
const { validationResult } = require('express-validator');
const { calculateMatchScore } = require('../services/matchingService');

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private (Job Seeker)
exports.applyJob = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { jobId, resumeId, coverLetter } = req.body;

        // Check if job exists and is open
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'This job is no longer accepting applications'
            });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: jobId,
            applicant: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this job'
            });
        }

        // Get resume data
        const resume = await Resume.findById(resumeId);
        if (!resume || resume.user.toString() !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found or not authorized'
            });
        }

        // Calculate match score
        const matchScore = await calculateMatchScore(job, resume.parsedData);

        // Create application
        const application = await Application.create({
            job: jobId,
            applicant: req.user.id,
            resume: resumeId,
            coverLetter,
            matchScore,
            statusHistory: [{
                status: 'pending',
                note: 'Application submitted'
            }]
        });

        // Add application to job
        job.applications.push(application._id);
        await job.save();

        res.status(201).json({
            success: true,
            application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all applications for a job (Employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer)
exports.getJobApplications = async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        // Check ownership
        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view these applications'
            });
        }

        const applications = await Application.find({ job: req.params.jobId })
            .populate('applicant', 'name email profile')
            .populate('resume')
            .sort({ matchScore: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get user's applications
// @route   GET /api/applications/me
// @access  Private (Job Seeker)
exports.getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ applicant: req.user.id })
            .populate('job', 'title department location employmentType')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            applications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private (Employer)
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status, note } = req.body;
        const application = await Application.findById(req.params.id)
            .populate('job', 'employer');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user is the employer
        if (application.job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this application'
            });
        }

        // Update status
        application.status = status;
        application.statusHistory.push({
            status,
            date: new Date(),
            note: note || `Status updated to ${status}`
        });

        await application.save();

        res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Schedule interview
// @route   PUT /api/applications/:id/schedule-interview
// @access  Private (Employer)
exports.scheduleInterview = async (req, res) => {
    try {
        const { interviewDate, interviewLocation, note } = req.body;
        const application = await Application.findById(req.params.id)
            .populate('job', 'employer');

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found'
            });
        }

        // Check if user is the employer
        if (application.job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to schedule interview for this application'
            });
        }

        application.interviewDate = interviewDate;
        application.interviewLocation = interviewLocation;
        application.status = 'interviewed';
        application.statusHistory.push({
            status: 'interviewed',
            date: new Date(),
            note: note || 'Interview scheduled'
        });

        await application.save();

        res.status(200).json({
            success: true,
            application
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
