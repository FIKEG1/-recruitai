const Delegation = require('../models/Delegation');

// @desc    Create delegation
// @route   POST /api/delegations
// @access  Private
exports.createDelegation = async (req, res) => {
    try {
        const delegation = await Delegation.create({
            ...req.body,
            delegator: req.user.id
        });

        res.status(201).json({ success: true, data: delegation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Get all delegations
// @route   GET /api/delegations
// @access  Private
exports.getDelegations = async (req, res) => {
    try {
        const delegations = await Delegation.find({
            $or: [
                { delegator: req.user.id },
                { delegate: req.user.id }
            ]
        })
            .populate('delegator', 'name email')
            .populate('delegate', 'name email');

        res.status(200).json({ success: true, data: delegations });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// @desc    Update delegation status
// @route   PUT /api/delegations/:id/status
// @access  Private
exports.updateDelegationStatus = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const delegation = await Delegation.findById(req.params.id);

        if (!delegation) {
            return res.status(404).json({ success: false, message: 'Delegation not found' });
        }

        // Check if user is delegator or delegate
        if (delegation.delegator.toString() !== req.user.id && 
            delegation.delegate.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        delegation.status = status;
        if (status === 'completed') {
            delegation.completedDate = new Date();
        }
        if (notes) delegation.notes = notes;

        await delegation.save();

        res.status(200).json({ success: true, data: delegation });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};