import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    Star,
    Zap,
    Target,
    Award,
    TrendingUp,
    CheckCircle,
    Lock,
    Flame,
    Crown
} from 'lucide-react';

const AchievementPopup = ({ achievement, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="fixed bottom-8 right-8 z-[9999] max-w-md"
        >
            <div className="bg-gradient-to-br from-amber-500/20 to-orange-500/20 backdrop-blur-xl border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-4">
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg"
                    >
                        <Trophy className="w-8 h-8 text-white" />
                    </motion.div>
                    <div className="flex-1">
                        <p className="text-amber-500 font-black text-xs uppercase tracking-widest mb-1">
                            Achievement Unlocked!
                        </p>
                        <h3 className="text-white font-black text-xl uppercase italic">
                            {achievement.title}
                        </h3>
                        <p className="text-zinc-400 text-sm font-bold mt-1">
                            +{achievement.xp} XP
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const LevelUpPopup = ({ level, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="text-center space-y-6"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 1
                    }}
                    className="inline-block"
                >
                    <Crown className="w-24 h-24 text-amber-500" />
                </motion.div>
                <div>
                    <h2 className="text-6xl font-black text-white uppercase italic mb-2">
                        Level Up!
                    </h2>
                    <p className="text-4xl font-black text-amber-500">
                        Level {level}
                    </p>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-4">
                        You're getting stronger!
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const StreakPopup = ({ streak, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-8 z-[9999] max-w-sm"
        >
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl border border-orange-500/30 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                    <Flame className="w-16 h-16 text-orange-500" />
                </div>
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Flame className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div>
                        <p className="text-orange-500 font-black text-[10px] uppercase tracking-[0.3em] mb-1">Elite Consistency</p>
                        <h3 className="text-white font-black text-2xl uppercase italic italic tracking-tighter">
                            {streak} DAY STREAK
                        </h3>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest mt-1">Uplink Maintained</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const GamificationContext = React.createContext();

export const useGamification = () => {
    const context = React.useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification must be used within a GamificationProvider');
    }
    return context;
};

const GamificationProvider = ({ children }) => {
    const [showAchievement, setShowAchievement] = useState(null);
    const [showLevelUp, setShowLevelUp] = useState(null);
    const [showStreak, setShowStreak] = useState(null);

    const unlockAchievement = (achievement) => {
        setShowAchievement(achievement);
    };

    const triggerLevelUp = (level) => {
        setShowLevelUp(level);
    };

    const triggerStreak = (streak) => {
        setShowStreak(streak);
    };

    const handleGamificationResult = (result) => {
        if (!result) return;

        if (result.leveledUp) {
            triggerLevelUp(result.currentLevel);
        }

        if (result.achievement && result.achievement.achievement) {
            unlockAchievement(result.achievement.achievement);
        }

        if (result.streak && result.streak.continued) {
            triggerStreak(result.streak.streak);
        }
    };

    return (
        <GamificationContext.Provider value={{ unlockAchievement, triggerLevelUp, triggerStreak, handleGamificationResult }}>
            {children}
            <AnimatePresence>
                {showAchievement && (
                    <AchievementPopup
                        achievement={showAchievement}
                        onClose={() => setShowAchievement(null)}
                    />
                )}
                {showLevelUp && (
                    <LevelUpPopup
                        level={showLevelUp}
                        onClose={() => setShowLevelUp(null)}
                    />
                )}
                {showStreak && (
                    <StreakPopup
                        streak={showStreak}
                        onClose={() => setShowStreak(null)}
                    />
                )}
            </AnimatePresence>
        </GamificationContext.Provider>
    );
};

export default GamificationProvider;
export { AchievementPopup, LevelUpPopup };
