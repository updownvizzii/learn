import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, TrendingUp, BookOpen, Award } from 'lucide-react';

/**
 * WelcomeBanner Component
 * Shows a beautiful welcome message for new users
 */
const WelcomeBanner = ({ userName, onDismiss }) => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Check if user has seen the welcome banner
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');

        if (!hasSeenWelcome) {
            setShowBanner(true);
        }
    }, []);

    const handleDismiss = () => {
        setShowBanner(false);
        localStorage.setItem('hasSeenWelcome', 'true');
        if (onDismiss) onDismiss();
    };

    if (!showBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mb-12"
            >
                <div className="relative bg-brand-surface border border-brand-primary/20 rounded-[2.5rem] p-10 overflow-hidden shadow-premium transition-all group">
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/10 rounded-full blur-[100px] group-hover:bg-brand-primary/20 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-[120px]"></div>

                    {/* Close button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-6 right-6 p-2 rounded-xl hover:bg-brand-bg/50 transition-all group z-20 border border-brand-border"
                    >
                        <X className="w-5 h-5 text-brand-muted group-hover:text-brand-text" />
                    </button>

                    {/* Content */}
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 bg-brand-primary rounded-3xl flex items-center justify-center border border-white/10 shadow-premium transform rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <Sparkles className="w-12 h-12 text-white" />
                            </div>
                        </div>

                        {/* Text content */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-3 mb-3 justify-center md:justify-start">
                                <span className="bg-brand-primary h-1 w-8 rounded-full"></span>
                                <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em]">Imperial Status Active</span>
                            </div>
                            <h2 className="text-4xl font-black text-brand-text mb-4 uppercase tracking-tight transition-colors">
                                WELCOME TO THE EMPIRE, {userName.split(' ')[0]}
                            </h2>
                            <p className="text-brand-muted text-lg mb-8 max-w-2xl leading-relaxed transition-colors">
                                Your strategic evolution begins now. Execute operations, dominate complex sectors, and scale your digital presence to absolute mastery.
                            </p>

                            {/* Quick stats */}
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2 bg-brand-bg/50 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-brand-border">
                                    <BookOpen className="w-4 h-4 text-brand-primary" />
                                    <span className="text-[10px] font-black text-brand-text uppercase tracking-widest transition-colors">100+ Sectors</span>
                                </div>
                                <div className="flex items-center gap-2 bg-brand-bg/50 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-brand-border">
                                    <Award className="w-4 h-4 text-brand-secondary" />
                                    <span className="text-[10px] font-black text-brand-text uppercase tracking-widest transition-colors">Rank Up</span>
                                </div>
                                <div className="flex items-center gap-2 bg-brand-bg/50 backdrop-blur-md rounded-2xl px-5 py-2.5 border border-brand-border">
                                    <TrendingUp className="w-4 h-4 text-brand-primary" />
                                    <span className="text-[10px] font-black text-brand-text uppercase tracking-widest transition-colors">Real-time sync</span>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <div className="flex-shrink-0">
                            <button
                                onClick={handleDismiss}
                                className="px-10 py-5 bg-brand-primary text-white font-black rounded-2xl hover:bg-brand-primary/90 transition-all shadow-premium uppercase tracking-wider text-xs border border-white/10"
                            >
                                Launch Operation
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default WelcomeBanner;
