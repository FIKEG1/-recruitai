const Configuration = require('../models/Configuration');

// @desc    Get all configurations
// @route   GET /api/config
// @access  Private (Admin)
exports.getConfigurations = async (req, res) => {
    try {
        const config = await Configuration.findOne();
        res.status(200).json({
            success: true,
            data: config || {}
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Create/Update organization info
// @route   PUT /api/config/organization
// @access  Private (Admin)
exports.updateOrganization = async (req, res) => {
    try {
        let config = await Configuration.findOne();
        if (!config) {
            config = await Configuration.create({ organization: req.body });
        } else {
            config.organization = { ...config.organization, ...req.body };
            await config.save();
        }
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add department
// @route   POST /api/config/departments
// @access  Private (Admin)
exports.addDepartment = async (req, res) => {
    try {
        let config = await Configuration.findOne();
        if (!config) {
            config = await Configuration.create({});
        }
        config.departments.push(req.body);
        await config.save();
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add position
// @route   POST /api/config/positions
// @access  Private (Admin)
exports.addPosition = async (req, res) => {
    try {
        let config = await Configuration.findOne();
        if (!config) {
            config = await Configuration.create({});
        }
        config.positions.push(req.body);
        await config.save();
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add leave type
// @route   POST /api/config/leave-types
// @access  Private (Admin)
exports.addLeaveType = async (req, res) => {
    try {
        let config = await Configuration.findOne();
        if (!config) {
            config = await Configuration.create({});
        }
        config.leaveTypes.push(req.body);
        await config.save();
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Add skill
// @route   POST /api/config/skills
// @access  Private (Admin)
exports.addSkill = async (req, res) => {
    try {
        let config = await Configuration.findOne();
        if (!config) {
            config = await Configuration.create({});
        }
        config.skills.push(req.body);
        await config.save();
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Delete configuration item
// @route   DELETE /api/config/:type/:id
// @access  Private (Admin)
exports.deleteConfigItem = async (req, res) => {
    try {
        const { type, id } = req.params;
        const config = await Configuration.findOne();
        if (!config) {
            return res.status(404).json({ success: false, message: 'Configuration not found' });
        }
        
        // Find the array and remove item
        const arrayFields = [
            'departments', 'positions', 'jobTitles', 'skills', 'languages',
            'licenses', 'religions', 'employmentStatus', 'educationLevels',
            'maritalStatus', 'trainingTypes', 'leaveTypes', 'terminationReasons',
            'deductionTypes', 'nations', 'titles', 'bloodTypes', 'partners'
        ];
        
        if (!arrayFields.includes(type)) {
            return res.status(400).json({ success: false, message: 'Invalid configuration type' });
        }
        
        config[type] = config[type].filter(item => item._id.toString() !== id);
        await config.save();
        
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};