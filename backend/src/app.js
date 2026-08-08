const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');

// ============================================
// ROUTE IMPORTS
// ============================================
// Core Routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');
const resumeRoutes = require('./routes/resumes');
const reportRoutes = require('./routes/reports');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const internshipRoutes = require('./routes/internships');

// ============================================
// NEW HRM MODULE ROUTES
// ============================================
const configRoutes = require('./routes/config');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaves');
const attendanceRoutes = require('./routes/attendance');
const trainingRoutes = require('./routes/training');
const complaintRoutes = require('./routes/complaints');
const delegationRoutes = require('./routes/delegations');

const app = express();

// Connect to database
connectDB();

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet());
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api', limiter);

// ============================================
// STATIC FILES FOR UPLOADS
// ============================================
const uploadsPath = path.join(__dirname, '../../uploads');
console.log('📁 Serving static files from:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// ============================================
// API ROUTES
// ============================================
// Core Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/internships', internshipRoutes);

// ============================================
// HRM MODULE ROUTES
// ============================================
app.use('/api/config', configRoutes);           // Configuration Module
app.use('/api/employees', employeeRoutes);      // Employee Module
app.use('/api/leaves', leaveRoutes);            // Leave Module
app.use('/api/attendance', attendanceRoutes);   // Attendance Module
app.use('/api/training', trainingRoutes);       // Training Module
app.use('/api/complaints', complaintRoutes);    // Complaint Module
app.use('/api/delegations', delegationRoutes);  // Delegation Module

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'Server is running',
        modules: {
            core: ['auth', 'jobs', 'applications', 'resumes', 'reports', 'upload', 'admin', 'internships'],
            hrm: ['config', 'employees', 'leaves', 'attendance', 'training', 'complaints', 'delegations']
        }
    });
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Something went wrong!'
    });
});

// ============================================
// CREATE UPLOADS DIRECTORY
// ============================================
const fs = require('fs');
const uploadDir = path.join(__dirname, '../../uploads');
const profileDir = path.join(__dirname, '../../uploads/profiles');
const resumeDir = path.join(__dirname, '../../uploads/resumes');
const documentDir = path.join(__dirname, '../../uploads/documents');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
if (!fs.existsSync(profileDir)) {
    fs.mkdirSync(profileDir, { recursive: true });
}
if (!fs.existsSync(resumeDir)) {
    fs.mkdirSync(resumeDir, { recursive: true });
}
if (!fs.existsSync(documentDir)) {
    fs.mkdirSync(documentDir, { recursive: true });
}

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}/api`);
    console.log(`📁 Uploads directory: ${uploadDir}`);
    
    console.log(`\n📋 Core Modules:`);
    console.log(`   ✅ Authentication: /api/auth`);
    console.log(`   ✅ Jobs: /api/jobs`);
    console.log(`   ✅ Applications: /api/applications`);
    console.log(`   ✅ Resumes: /api/resumes`);
    console.log(`   ✅ Reports: /api/reports`);
    console.log(`   ✅ Upload: /api/upload`);
    console.log(`   ✅ Admin: /api/admin`);
    console.log(`   ✅ Internships: /api/internships`);
    
    console.log(`\n📋 HRM Modules:`);
    console.log(`   ✅ Configuration: /api/config`);
    console.log(`   ✅ Employees: /api/employees`);
    console.log(`   ✅ Leave Management: /api/leaves`);
    console.log(`   ✅ Attendance: /api/attendance`);
    console.log(`   ✅ Training: /api/training`);
    console.log(`   ✅ Complaints: /api/complaints`);
    console.log(`   ✅ Delegations: /api/delegations`);
});

module.exports = app;