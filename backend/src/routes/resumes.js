const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
    uploadResume, 
    getResumes, 
    setDefaultResume, 
    deleteResume 
} = require('../controllers/resumeController');
const { protect, authorize } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter
});

// @route   POST /api/resumes
// @desc    Upload resume
// @access  Private (Job Seeker)
router.post('/', protect, authorize('jobseeker'), upload.single('resume'), uploadResume);

// @route   GET /api/resumes
// @desc    Get user's resumes
// @access  Private (Job Seeker)
router.get('/', protect, authorize('jobseeker'), getResumes);

// @route   PUT /api/resumes/:id/default
// @desc    Set default resume
// @access  Private (Job Seeker)
router.put('/:id/default', protect, authorize('jobseeker'), setDefaultResume);

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private (Job Seeker)
router.delete('/:id', protect, authorize('jobseeker'), deleteResume);

module.exports = router;