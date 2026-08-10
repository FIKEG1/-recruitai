const User = require('../models/User');

// @desc    Get all candidates (Jobseekers)
// @route   GET /api/candidates
// @access  Public (or Private to employers)
exports.getCandidates = async (req, res) => {
    try {
        const { search, location, skills, minRating, page = 1, limit = 12 } = req.query;
        
        let query = { role: 'jobseeker' };

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { 'profile.title': { $regex: search, $options: 'i' } },
                { 'profile.bio': { $regex: search, $options: 'i' } }
            ];
        }

        if (location) {
            query['profile.location'] = { $regex: location, $options: 'i' };
        }

        if (skills) {
            const skillsArray = skills.split(',');
            query['profile.skills'] = { $in: skillsArray.map(s => new RegExp(s.trim(), 'i')) };
        }

        if (minRating) {
            query['profile.rating.score'] = { $gte: parseFloat(minRating) };
        }

        const candidates = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            candidates,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalCandidates: count
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
};
