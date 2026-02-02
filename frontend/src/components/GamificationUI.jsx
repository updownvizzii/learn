import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, Star, Crown } from 'lucide-react';

const XPBar = ({ currentXP, requiredXP, level }) => {
    const percentage = (currentXP / requiredXP) * 100;

    return (
        <div className="bg-brand-surface rounded-2xl border border-brand-border p-6 shadow-premium transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-brand-muted text-xs font-black uppercase tracking-widest transition-colors">
                            Current Level
                        </p>
                        <p className="text-3xl font-black text-brand-text transition-colors">
                            {level}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-brand-muted text-xs font-black uppercase tracking-widest transition-colors">
                        Experience
                    </p>
                    <p className="text-xl font-black text-brand-primary transition-colors">
                        {currentXP.toLocaleString()} / {requiredXP.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* XP Progress Bar */}
            <div className="relative h-4 bg-black rounded-full overflow-hidden border border-[#1F1F1F]">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-xs font-black uppercase tracking-wider drop-shadow-lg">
                        {percentage.toFixed(0)}%
                    </span>
                </div>
            </div>

            {/* Next Level Info */}
            <p className="text-brand-muted text-xs font-bold text-center mt-3 transition-colors">
                {requiredXP - currentXP} XP to Level {level + 1}
            </p>
        </div>
    );
};

const StreakCounter = ({ streak, bestStreak }) => {
    return (
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 p-6">
            <div className="flex items-center gap-4">
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                    }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center"
                >
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                    >
                        🔥
                    </motion.div>
                </motion.div>
                <div className="flex-1">
                    <p className="text-brand-primary text-xs font-black uppercase tracking-widest mb-1 transition-colors">
                        Daily Streak
                    </p>
                    <p className="text-4xl font-black text-brand-text transition-colors">
                        {streak} Days
                    </p>
                    <p className="text-brand-muted text-xs font-bold mt-1 transition-colors">
                        Best: {bestStreak} days
                    </p>
                </div>
            </div>
        </div>
    );
};

const AchievementBadge = ({ achievement }) => {
    const { title, description, icon, unlocked, progress, total, rarity } = achievement;

    const rarityColors = {
        common: 'from-zinc-500 to-zinc-600',
        rare: 'from-blue-500 to-blue-600',
        epic: 'from-purple-500 to-purple-600',
        legendary: 'from-amber-500 to-orange-500'
    };

    return (
        <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className={`bg-brand-surface rounded-2xl border ${unlocked ? 'border-brand-primary/50' : 'border-brand-border'
                } p-6 ${!unlocked && 'opacity-50'} transition-all cursor-pointer shadow-premium`}
        >
            <div className="flex items-start gap-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${rarityColors[rarity] || rarityColors.common
                    } flex items-center justify-center text-2xl flex-shrink-0 shadow-lg`}>
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-white font-black text-sm uppercase italic truncate">
                            {title}
                        </h4>
                        {unlocked && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex-shrink-0"
                            >
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            </motion.div>
                        )}
                    </div>
                    <p className="text-zinc-500 text-xs font-bold mb-3">
                        {description}
                    </p>
                    {!unlocked && progress !== undefined && (
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-brand-muted text-xs font-bold transition-colors">
                                    {progress}/{total}
                                </span>
                                <span className="text-brand-primary text-xs font-black transition-colors">
                                    {Math.round((progress / total) * 100)}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-black rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(progress / total) * 100}%` }}
                                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const LeaderboardCard = ({ rank, user, score, isCurrentUser }) => {
    const medalColors = {
        1: 'from-amber-500 to-yellow-500',
        2: 'from-zinc-400 to-zinc-500',
        3: 'from-orange-600 to-orange-700'
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: rank * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-2xl border ${isCurrentUser
                ? 'bg-brand-primary/10 border-brand-primary/50'
                : 'bg-brand-surface border-brand-border'
                } hover:border-brand-primary/30 transition-all shadow-premium`}
        >
            {/* Rank */}
            <div className={`w-12 h-12 rounded-xl ${rank <= 3
                ? `bg-gradient-to-br ${medalColors[rank]} shadow-lg`
                : 'bg-zinc-800'
                } flex items-center justify-center flex-shrink-0`}>
                <span className="text-white font-black text-lg">
                    {rank <= 3 ? '🏆' : rank}
                </span>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
                <p className={`font-black uppercase truncate ${isCurrentUser ? 'text-blue-500' : 'text-white'
                    }`}>
                    {user}
                </p>
                <p className="text-zinc-500 text-xs font-bold">
                    Level {Math.floor(score / 1000)}
                </p>
            </div>

            {/* Score */}
            <div className="text-right">
                <p className="text-xl font-black text-white">
                    {score.toLocaleString()}
                </p>
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-wider">
                    XP
                </p>
            </div>
        </motion.div>
    );
};

export { XPBar, StreakCounter, AchievementBadge, LeaderboardCard };
export default XPBar;
