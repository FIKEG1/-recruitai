const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Create an internship posting
// @route   POST /api/internships
// @access  Private (Employer)
exports.createInternship = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const internshipData = {
            ...req.body,
            employer: req.user.id,
            employmentType: 'Internship',
            isInternship: true
        };

        const internship = await Job.create(internshipData);

        res.status(201).json({
            success: true,
            internship
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get all internships
// @route   GET /api/internships
// @access  Public
exports.getInternships = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search, 
            location, 
            internshipType,
            internshipDuration,
            fieldOfStudy,
            yearOfStudy,
            minGPA
        } = req.query;
        
        const query = { 
            isInternship: true,
            status: 'open'
        };
        
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
        
        if (internshipType) {
            query.internshipType = internshipType;
        }
        
        if (internshipDuration) {
            query.internshipDuration = internshipDuration;
        }
        
        if (fieldOfStudy) {
            query['academicRequirements.fieldOfStudy'] = { $in: [fieldOfStudy] };
        }
        
        if (yearOfStudy) {
            query['academicRequirements.yearOfStudy'] = yearOfStudy;
        }
        
        if (minGPA) {
            query['academicRequirements.minimumGPA'] = { $gte: parseFloat(minGPA) };
        }

        const internships = await Job.find(query)
            .populate('employer', 'name company')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Job.countDocuments(query);

        res.status(200).json({
            success: true,
            internships,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalInternships: count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Get single internship
// @route   GET /api/internships/:id
// @access  Public
exports.getInternship = async (req, res) => {
    try {
        const internship = await Job.findOne({
            _id: req.params.id,
            isInternship: true
        }).populate('employer', 'name email company');

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        internship.viewCount += 1;
        await internship.save();

        res.status(200).json({
            success: true,
            internship
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update internship
// @route   PUT /api/internships/:id
// @access  Private (Employer)
exports.updateInternship = async (req, res) => {
    try {
        let internship = await Job.findOne({
            _id: req.params.id,
            isInternship: true
        });

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        if (internship.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this internship'
            });
        }

        internship = await Job.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({
            success: true,
            internship
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Delete internship
// @route   DELETE /api/internships/:id
// @access  Private (Employer)
exports.deleteInternship = async (req, res) => {
    try {
        const internship = await Job.findOne({
            _id: req.params.id,
            isInternship: true
        });

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found'
            });
        }

        if (internship.employer.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this internship'
            });
        }

        await internship.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Internship deleted successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Apply for internship
// @route   POST /api/internships/:id/apply
// @access  Private (Job Seeker)
exports.applyInternship = async (req, res) => {
    try {
        const { resumeId, coverLetter, academicInfo } = req.body;
        
        const internship = await Job.findOne({
            _id: req.params.id,
            isInternship: true,
            status: 'open'
        });

        if (!internship) {
            return res.status(404).json({
                success: false,
                message: 'Internship not found or not accepting applications'
            });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            job: internship._id,
            applicant: req.user.id
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'You have already applied for this internship'
            });
        }

        // Create application with internship-specific data
        const application = await Application.create({
            job: internship._id,
            applicant: req.user.id,
            resume: resumeId,
            coverLetter,
            matchScore: calculateInternshipMatch(internship, req.user, academicInfo),
            status: 'pending',
            statusHistory: [{
                status: 'pending',
                note: 'Internship application submitted'
            }],
            // Store internship-specific info
            academicInfo: academicInfo || {}
        });

        internship.applications.push(application._id);
        await internship.save();

        res.status(201).json({
            success: true,
            application,
            message: 'Internship application submitted successfully!'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// Helper: Calculate internship match score
function calculateInternshipMatch(internship, applicant, academicInfo) {
    let score = 0;
    let weights = {
        skills: 0.30,
        fieldOfStudy: 0.25,
        gpa: 0.15,
        yearOfStudy: 0.20,
        location: 0.10
    };

    // Skills matching
    const jobSkills = internship.requirements?.skills || [];
    const applicantSkills = applicant.profile?.skills || [];
    if (jobSkills.length > 0 && applicantSkills.length > 0) {
        const matching = jobSkills.filter(skill => 
            applicantSkills.some(us => us.toLowerCase().includes(skill.toLowerCase()))
        );
        const skillScore = (matching.length / jobSkills.length) * 100;
        score += skillScore * weights.skills;
    }

    // Field of study matching
    const jobFields = internship.academicRequirements?.fieldOfStudy || [];
    if (jobFields.length > 0 && academicInfo?.fieldOfStudy) {
        const fieldMatch = jobFields.some(f => 
            f.toLowerCase().includes(academicInfo.fieldOfStudy.toLowerCase()) ||
            academicInfo.fieldOfStudy.toLowerCase().includes(f.toLowerCase())
        );
        score += (fieldMatch ? 100 : 50) * weights.fieldOfStudy;
    }

    // GPA matching
    const minGPA = internship.academicRequirements?.minimumGPA || 0;
    if (minGPA > 0 && academicInfo?.gpa) {
        const gpaScore = Math.min((academicInfo.gpa / minGPA) * 100, 100);
        score += gpaScore * weights.gpa;
    }

    // Year of study matching
    const requiredYear = internship.academicRequirements?.yearOfStudy || 'Any';
    if (requiredYear !== 'Any' && academicInfo?.yearOfStudy) {
        const yearMatch = requiredYear === academicInfo.yearOfStudy;
        score += (yearMatch ? 100 : 50) * weights.yearOfStudy;
    }

    // Location matching
    if (internship.location && applicant.profile?.location) {
        const locMatch = internship.location.toLowerCase().includes(applicant.profile.location.toLowerCase()) ||
                        applicant.profile.location.toLowerCase().includes(internship.location.toLowerCase());
        score += (locMatch ? 100 : 50) * weights.location;
    }

    return Math.round(score);
}