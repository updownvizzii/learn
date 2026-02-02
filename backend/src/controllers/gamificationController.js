const User = require('../models/User');

// XP thresholds for each level
const getRequiredXP = (level) => {
    return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Award XP to user
const awardXP = async (userId, xpAmount, reason) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const oldLevel = user.level;
        user.xp += xpAmount;

        // Check for level up
        let requiredXP = getRequiredXP(user.level);
        while (user.xp >= requiredXP) {
            user.xp -= requiredXP;
            user.level += 1;
            requiredXP = getRequiredXP(user.level);

            // Trigger level-based achievements
            if (user.level === 10) {
                await unlockAchievement(user._id, {
                    achievementId: 'level_10',
                    title: 'Master Student',
                    xp: 500
                });
            } else if (user.level === 25) {
                await unlockAchievement(user._id, {
                    achievementId: 'level_25',
                    title: 'Elite Scholar',
                    xp: 1000
                });
            }
        }

        await user.save();

        return {
            xpAwarded: xpAmount,
            currentXP: user.xp,
            currentLevel: user.level,
            leveledUp: user.level > oldLevel,
            newLevel: user.level > oldLevel ? user.level : null,
            requiredXP: getRequiredXP(user.level),
            reason
        };
    } catch (error) {
        console.error('Error awarding XP:', error);
        return null;
    }
};

// Unlock achievement
const unlockAchievement = async (userId, achievementData) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        // Check if already unlocked
        const alreadyUnlocked = user.achievements.some(
            a => a.achievementId === achievementData.achievementId
        );

        if (alreadyUnlocked) return null;

        // Add achievement
        user.achievements.push({
            achievementId: achievementData.achievementId,
            title: achievementData.title,
            xpAwarded: achievementData.xp
        });

        await user.save();

        // Award XP for achievement
        const xpResult = await awardXP(userId, achievementData.xp, `Achievement: ${achievementData.title}`);

        return {
            achievement: achievementData,
            xpResult
        };
    } catch (error) {
        console.error('Error unlocking achievement:', error);
        return null;
    }
};

// Update streak
const updateStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastStreakDate = user.lastStreakDate ? new Date(user.lastStreakDate) : null;
        if (lastStreakDate) {
            lastStreakDate.setHours(0, 0, 0, 0);
        }

        const oneDayAgo = new Date(today);
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        if (!lastStreakDate || lastStreakDate.getTime() === today.getTime()) {
            // Already logged in today
            return { streak: user.streak, continued: false };
        } else if (lastStreakDate.getTime() === oneDayAgo.getTime()) {
            // Continuing streak
            user.streak += 1;
            user.lastStreakDate = today;

            if (user.streak > user.bestStreak) {
                user.bestStreak = user.streak;
            }

            await user.save();

            // Award XP for streak milestones
            if (user.streak % 7 === 0) {
                await awardXP(userId, 100, `${user.streak} Day Streak!`);
            }

            return { streak: user.streak, continued: true, milestone: user.streak % 7 === 0 };
        } else {
            // Streak broken
            user.streak = 1;
            user.lastStreakDate = today;
            await user.save();
            return { streak: 1, continued: false, broken: true };
        }
    } catch (error) {
        console.error('Error updating streak:', error);
        return null;
    }
};

// Get user gamification stats
const getGamificationStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const requiredXP = getRequiredXP(user.level);

        res.json({
            xp: user.xp,
            level: user.level,
            requiredXP,
            streak: user.streak,
            bestStreak: user.bestStreak,
            achievements: user.achievements,
            badges: user.badges,
            totalAchievements: user.achievements.length
        });
    } catch (error) {
        console.error('Error fetching gamification stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Award XP endpoint
const awardXPEndpoint = async (req, res) => {
    try {
        const { xpAmount, reason } = req.body;
        const result = await awardXP(req.user._id, xpAmount, reason);

        if (!result) {
            return res.status(400).json({ message: 'Failed to award XP' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error in awardXP endpoint:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Unlock achievement endpoint
const unlockAchievementEndpoint = async (req, res) => {
    try {
        const achievementData = req.body;
        const result = await unlockAchievement(req.user._id, achievementData);

        if (!result) {
            return res.status(400).json({ message: 'Achievement already unlocked or error occurred' });
        }

        res.json(result);
    } catch (error) {
        console.error('Error in unlockAchievement endpoint:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get leaderboard
const getLeaderboard = async (req, res) => {
    try {
        const { limit = 100 } = req.query;

        const users = await User.find({ role: 'student' })
            .select('username profilePicture xp level')
            .sort({ xp: -1, level: -1 })
            .limit(parseInt(limit));

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            username: user.username,
            profilePicture: user.profilePicture,
            xp: user.xp,
            level: user.level,
            isCurrentUser: user._id.toString() === req.user._id.toString()
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    awardXP,
    unlockAchievement,
    updateStreak,
    getGamificationStats,
    awardXPEndpoint,
    unlockAchievementEndpoint,
    getLeaderboard,
    getRequiredXP
};
