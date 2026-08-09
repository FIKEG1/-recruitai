const Configuration = require('../models/Configuration');

// Generic add function for all config types
const addConfigItem = async (req, res, arrayName) => {
    try {
        console.log(`=== Add ${arrayName} Debug ===`);
        console.log('Request body:', req.body);
        
        let config = await Configuration.findOne();
        if (!config) {
            config = await Configuration.create({});
        }
        
        if (!config[arrayName]) {
            config[arrayName] = [];
        }
        
        config[arrayName].push(req.body);
        await config.save();
        res.status(201).json({ success: true, data: config });
    } catch (error) {
        console.error(`Add ${arrayName} Error:`, error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

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
exports.addDepartment = async (req, res) => addConfigItem(req, res, 'departments');

// @desc    Add position
// @route   POST /api/config/positions
// @access  Private (Admin)
exports.addPosition = async (req, res) => addConfigItem(req, res, 'positions');

// @desc    Add leave type
// @route   POST /api/config/leave-types
// @access  Private (Admin)
exports.addLeaveType = async (req, res) => addConfigItem(req, res, 'leaveTypes');

// @desc    Add skill
// @route   POST /api/config/skills
// @access  Private (Admin)
exports.addSkill = async (req, res) => addConfigItem(req, res, 'skills');

// Additional config type handlers
exports.addJobTitle = async (req, res) => addConfigItem(req, res, 'jobTitles');
exports.addLanguage = async (req, res) => addConfigItem(req, res, 'languages');
exports.addLicense = async (req, res) => addConfigItem(req, res, 'licenses');
exports.addReligion = async (req, res) => addConfigItem(req, res, 'religions');
exports.addEmploymentStatus = async (req, res) => addConfigItem(req, res, 'employmentStatus');
exports.addEducationLevel = async (req, res) => addConfigItem(req, res, 'educationLevels');
exports.addMaritalStatus = async (req, res) => addConfigItem(req, res, 'maritalStatus');
exports.addTrainingType = async (req, res) => addConfigItem(req, res, 'trainingTypes');
exports.addTerminationReason = async (req, res) => addConfigItem(req, res, 'terminationReasons');
exports.addDeductionType = async (req, res) => addConfigItem(req, res, 'deductionTypes');
exports.addNation = async (req, res) => addConfigItem(req, res, 'nations');
exports.addTitle = async (req, res) => addConfigItem(req, res, 'titles');
exports.addBloodType = async (req, res) => addConfigItem(req, res, 'bloodTypes');
exports.addPartner = async (req, res) => addConfigItem(req, res, 'partners');
exports.addPositionRank = async (req, res) => addConfigItem(req, res, 'positionRanks');

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
        
        // Map route types to array names
        const typeToField = {
            'departments': 'departments',
            'positions': 'positions',
            'leave-types': 'leaveTypes',
            'skills': 'skills',
            'job-titles': 'jobTitles',
            'languages': 'languages',
            'licenses': 'licenses',
            'religions': 'religions',
            'employment-status': 'employmentStatus',
            'education-levels': 'educationLevels',
            'marital-status': 'maritalStatus',
            'training-types': 'trainingTypes',
            'termination-reasons': 'terminationReasons',
            'deduction-types': 'deductionTypes',
            'nations': 'nations',
            'titles': 'titles',
            'blood-types': 'bloodTypes',
            'partners': 'partners',
            'position-ranks': 'positionRanks'
        };
        
        const fieldName = typeToField[type] || type;
        
        if (!config[fieldName]) {
            return res.status(400).json({ success: false, message: 'Invalid configuration type' });
        }
        
        config[fieldName] = config[fieldName].filter(item => item._id.toString() !== id);
        await config.save();
        
        res.status(200).json({ success: true, data: config });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};