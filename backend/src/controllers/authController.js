const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstErrorMsg = errors.array().map(e => e.msg).join(', ');
            return res.status(400).json({
                success: false,
                message: firstErrorMsg || 'Invalid input data',
                errors: errors.array()
            });
        }

        const { name, email, password, role, profile, company } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || 'jobseeker',
            profile: profile || {},
            company: company || {}
        });

        // Generate token
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                company: user.company
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        console.log('=== Login Debug ===');
        console.log('Email:', req.body.email);
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const firstErrorMsg = errors.array().map(e => e.msg).join(', ');
            return res.status(400).json({
                success: false,
                message: firstErrorMsg || 'Invalid input data',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Normalize email to lowercase
        const normalizedEmail = email.toLowerCase().trim();
        
        // Check for user
        const user = await User.findOne({ email: normalizedEmail }).select('+password');
        console.log('User found:', user ? 'Yes' : 'No');
        
        if (!user) {
            console.log('User not found in database');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        console.log('User ID:', user._id);
        console.log('User email:', user.email);
        console.log('User role:', user.role);

        // Check password
        const isMatch = await user.matchPassword(password);
        console.log('Password match:', isMatch ? 'Yes' : 'No');
        
        if (!isMatch) {
            console.log('Password does not match');
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                company: user.company
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Server Error'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, profile, company } = req.body;
        const user = await User.findById(req.user.id);

        if (name) user.name = name;
        if (profile) {
            const existingProfile = user.profile ? (user.profile.toObject ? user.profile.toObject() : user.profile) : {};
            user.profile = { ...existingProfile, ...profile };
            user.markModified('profile');
        }
        if (company) {
            const existingCompany = user.company ? (user.company.toObject ? user.company.toObject() : user.company) : {};
            user.company = { ...existingCompany, ...company };
            user.markModified('company');
        }

        await user.save();

        res.status(200).json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// ============================================
// PASSWORD RESET FUNCTIONALITY
// ============================================

// @desc    Forgot password - Generate reset token
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate email
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an email address'
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No user found with this email'
            });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL (for frontend)
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

        // TODO: Send email with reset URL
        // For now, return the token in response for testing
        res.status(200).json({
            success: true,
            message: 'Password reset token generated. Check your email for the reset link.',
            resetToken: resetToken,
            resetUrl: resetUrl
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resetToken
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        const { password } = req.body;

        // Validate password
        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a password with at least 6 characters'
            });
        }

        // Hash the token from URL
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        // Find user with matching token and not expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token. Please request a new password reset.'
            });
        }

        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        // Generate new JWT token for immediate login
        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile: user.profile,
                company: user.company
            },
            message: 'Password reset successful! You are now logged in.'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};

// @desc    Verify reset token
// @route   GET /api/auth/verifyresettoken/:resetToken
// @access  Public
exports.verifyResetToken = async (req, res) => {
    try {
        // Hash the token from URL
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');

        // Find user with matching token and not expired
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            email: user.email
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};