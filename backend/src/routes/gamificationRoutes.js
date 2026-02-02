const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    getGamificationStats,
    awardXPEndpoint,
    unlockAchievementEndpoint,
    getLeaderboard
} = require('../controllers/gamificationController');

// All routes require authentication
router.use(protect);

// Get user's gamification stats
router.get('/stats', getGamificationStats);

// Award XP (can be called when user completes actions)
router.post('/award-xp', awardXPEndpoint);

// Unlock achievement
router.post('/unlock-achievement', unlockAchievementEndpoint);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router;
