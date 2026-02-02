const User = require('../models/User');

// Middleware to update user's last active timestamp
const updateLastActive = async (req, res, next) => {
    try {
        if (req.user && req.user.id) {
            // Update lastActive timestamp without waiting for it to complete
            User.findByIdAndUpdate(
                req.user.id,
                { lastActive: new Date() },
                { new: false }
            ).exec().catch(err => console.error('Error updating lastActive:', err));
        }
    } catch (error) {
        console.error('Error in updateLastActive middleware:', error);
    }
    next();
};

module.exports = { updateLastActive };
