import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, TrendingUp } from 'lucide-react';

/**
 * InactivityAlert Component
 * Shows a friendly reminder when user has been inactive for a certain period
 */
const InactivityAlert = ({ lastActive, onDismiss }) => {
    const [showAlert, setShowAlert] = useState(false);
    const [daysSinceActive, setDaysSinceActive] = useState(0);

    useEffect(() => {
        if (!lastActive) return;

        const checkInactivity = () => {
            const now = new Date();
            const lastActiveDate = new Date(lastActive);
            const diffTime = Math.abs(now - lastActiveDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            setDaysSinceActive(diffDays);

            // Show alert if inactive for 3 or more days
            if (diffDays >= 3) {
                setShowAlert(true);
            }
        };

        checkInactivity();
        // Check every hour
        const interval = setInterval(checkInactivity, 1000 * 60 * 60);

        return () => clearInterval(interval);
    }, [lastActive]);

    const handleDismiss = () => {
        setShowAlert(false);
        if (onDismiss) onDismiss();
    };

    if (!showAlert) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="fixed top-20 right-4 z-50 max-w-md"
            >
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                    {/* Decorative background pattern */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl"></div>

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-amber-100 transition-colors group"
                    >
                        <X className="w-5 h-5 text-amber-600 group-hover:text-amber-800" />
                    </button>

                    {/* Content */}
                    <div className="relative z-10">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="p-3 bg-amber-100 rounded-xl">
                                <AlertCircle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 mb-1">
                                    We Miss You! 👋
                                </h3>
                                <p className="text-sm text-gray-600">
                                    It's been <span className="font-bold text-amber-700">{daysSinceActive} days</span> since your last visit.
                                </p>
                            </div>
                        </div>

                        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 mb-4">
                            <p className="text-sm text-gray-700 mb-3">
                                Don't let your learning streak break! Continue where you left off and keep building your skills.
                            </p>

                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                                <span>Students who learn consistently achieve <strong>3x better results</strong></span>
                            </div>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all transform hover:scale-105 shadow-lg"
                        >
                            Continue Learning
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InactivityAlert;
