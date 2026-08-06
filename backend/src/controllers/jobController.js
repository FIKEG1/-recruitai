const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { matchCandidates } = require('../services/matchingService');

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Employer/Admin)
exports.createJob = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const jobData = {
            ...req.body,
            employer: req.user.id
        };

        const job = await Job.create(jobData);

        res.status(201).json({
            success: true,
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
exports.getJobs = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, location, employmentType, minSalary, maxSalary } = req.query;
        
        const query = { status: 'open' };
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        
        if (employmentType) {
            query.employmentType = employmentType;
        }
        
        if (minSalary || maxSalary) {
            query.salary = {};
            if (minSalary) query.salary.min = { $gte: parseInt(minSalary) };
            if (maxSalary) query.salary.max = { $lte: parseInt(maxSalary) };
        }

        const jobs = await Job.find(query)
            .populate('employer', 'name company')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            jobs,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalJobs: count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Public
exports.getJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('employer', 'name email company')
            .populate('applications', 'status');

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        job.viewCount += 1;
        await job.save();

        res.status(200).json({
            success: true,
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private (Employer/Admin)
exports.updateJob = async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this job'
            });
        }

        job = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            job
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer/Admin)
exports.deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this job'
            });
        }

        await job.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get employer's jobs
// @route   GET /api/jobs/employer/me
// @access  Private (Employer)
exports.getEmployerJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ employer: req.user.id })
            .populate('applications', 'status')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            jobs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get matching candidates for a job
// @route   GET /api/jobs/:id/matches
// @access  Private (Employer)
exports.getMatchingCandidates = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view candidates for this job'
            });
        }

        const jobSeekers = await User.find({ role: 'jobseeker' });
        const applications = await Application.find({ job: job._id });
        const applicantIds = applications.map(app => app.applicant.toString());

        const matchedCandidates = [];

        res.status(200).json({
            success: true,
            candidates: matchedCandidates
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};