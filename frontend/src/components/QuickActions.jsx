import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Award, Clock, Target, Zap } from 'lucide-react';

/**
 * Quick Actions Component
 * Provides easy access to common student actions
 */
const QuickActions = ({ onAction }) => {
    const actions = [
        {
            id: 'continue-learning',
            icon: BookOpen,
            label: 'Resume Ops',
            description: 'Back to active sector',
            color: 'from-brand-primary/80 to-brand-primary',
            bgColor: 'bg-brand-primary/10',
            textColor: 'text-brand-primary'
        },
        {
            id: 'browse-courses',
            icon: Target,
            label: 'Expand Grid',
            description: 'Explore new objectives',
            color: 'from-brand-secondary/80 to-brand-primary',
            bgColor: 'bg-brand-secondary/10',
            textColor: 'text-brand-secondary'
        },
        {
            id: 'view-certificates',
            icon: Award,
            label: 'My Credentials',
            description: 'Validate expertise',
            color: 'from-brand-primary to-brand-secondary',
            bgColor: 'bg-brand-primary/10',
            textColor: 'text-brand-primary'
        },
        {
            id: 'set-goals',
            icon: Zap,
            label: 'Strategy Room',
            description: 'Define next targets',
            color: 'from-brand-primary/60 to-brand-secondary/40',
            bgColor: 'bg-brand-primary/10',
            textColor: 'text-brand-primary'
        }
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {actions.map((action, index) => (
                <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onAction && onAction(action.id)}
                    className="relative bg-brand-surface rounded-[2rem] p-8 shadow-premium border border-brand-border hover:border-brand-primary/40 transition-all duration-300 group text-left overflow-hidden glimmer"
                >
                    <div className="relative z-10">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-2xl ${action.bgColor} flex items-center justify-center mb-6 border border-brand-border shadow-xl group-hover:shadow-brand-primary/20 transition-all`}>
                            <action.icon className={`w-7 h-7 ${action.textColor}`} />
                        </div>

                        {/* Label */}
                        <h3 className="font-black text-brand-text mb-2 text-lg uppercase tracking-tight transition-colors">{action.label}</h3>
                        <p className="text-xs text-brand-muted font-bold uppercase tracking-widest transition-colors">{action.description}</p>
                    </div>

                    {/* Arrow indicator */}
                    <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                        <svg className="w-5 h-5 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                </motion.button>
            ))}
        </div>
    );
};

export default QuickActions;
