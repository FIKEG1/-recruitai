const Resume = require('../models/Resume');
const path = require('path');
const fs = require('fs');

// @desc    Upload resume
// @route   POST /api/resumes
// @access  Private (Job Seeker)
exports.uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Please upload a file'
            });
        }

        const fileType = req.file.originalname.split('.').pop().toLowerCase();
        if (!['pdf', 'docx'].includes(fileType)) {
            return res.status(400).json({
                success: false,
                message: 'Only PDF and DOCX files are supported'
            });
        }

        const parsedData = {
            name: req.body.name || '',
            email: '',
            phone: '',
            education: [],
            workExperience: [],
            skills: [],
            certifications: [],
            languages: []
        };

        const resume = await Resume.create({
            user: req.user.id,
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: fileType,
            parsedData: parsedData
        });

        const resumeCount = await Resume.countDocuments({ user: req.user.id });
        if (resumeCount === 1) {
            resume.isDefault = true;
            await resume.save();
        }

        res.status(201).json({
            success: true,
            resume
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get user's resumes
// @route   GET /api/resumes
// @access  Private (Job Seeker)
exports.getResumes = async (req, res) => {
    try {
        const resumes = await Resume.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            resumes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Set default resume
// @route   PUT /api/resumes/:id/default
// @access  Private (Job Seeker)
exports.setDefaultResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await Resume.updateMany({ user: req.user.id }, { isDefault: false });

        resume.isDefault = true;
        await resume.save();

        res.status(200).json({
            success: true,
            resume
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private (Job Seeker)
exports.deleteResume = async (req, res) => {
    try {
        const resume = await Resume.findById(req.params.id);
        if (!resume) {
            return res.status(404).json({
                success: false,
                message: 'Resume not found'
            });
        }

        if (resume.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        if (fs.existsSync(resume.filePath)) {
            fs.unlinkSync(resume.filePath);
        }

        await resume.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Resume deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};