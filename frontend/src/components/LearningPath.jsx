import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Lock, Loader2 } from 'lucide-react';

// Wrapper component for backward compatibility
const LearningPathWrapper = ({ courses, fullStats, milestones, currentLevel }) => {
    // If milestones are provided directly, use them
    if (milestones) {
        return <LearningJourney milestones={milestones} currentLevel={currentLevel || 0} />;
    }

    // Otherwise, convert courses to milestones format
    const convertedMilestones = courses && courses.length > 0 ? courses.slice(0, 4).map((course, index) => ({
        title: course.title || 'Course',
        subtitle: `${course.category || 'Learning'} Module`,
        status: course.isCompleted ? 'completed' : (index === 0 ? 'active' : 'locked'),
        progress: course.progress || 0,
        units: `${course.sections?.length || 0} sections`
    })) : [
        {
            title: 'START YOUR JOURNEY',
            subtitle: 'No courses enrolled',
            status: 'locked',
            units: 'Enroll in a course to begin'
        }
    ];

    return (
        <LearningJourney
            milestones={convertedMilestones}
            currentLevel={courses?.length || 0}
        />
    );
};

const LearningJourney = ({ milestones = [], currentLevel = 0 }) => {
    // Handle empty milestones
    if (!milestones || milestones.length === 0) {
        milestones = [{
            title: 'START YOUR JOURNEY',
            subtitle: 'No milestones yet',
            status: 'locked',
            units: 'Begin your learning path'
        }];
    }

    return (
        <div className="bg-brand-surface rounded-[3rem] border border-brand-border p-8 md:p-12 shadow-premium transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-12">
                <div>
                    <h2 className="text-3xl font-black text-brand-text uppercase italic tracking-tight transition-colors">
                        Strategic Journey
                    </h2>
                    <p className="text-brand-muted text-xs font-black uppercase tracking-widest mt-2 transition-colors">
                        Evolution Through The Ranks
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-6xl font-black text-brand-primary transition-colors">
                        {currentLevel}
                    </p>
                    <p className="text-brand-muted text-xs font-black uppercase tracking-widest transition-colors">
                        Active Units
                    </p>
                </div>
            </div>

            {/* Journey Path */}
            <div className="space-y-6">
                {milestones.map((milestone, index) => (
                    <MilestoneCard
                        key={index}
                        milestone={milestone}
                        index={index}
                        isLast={index === milestones.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};

const MilestoneCard = ({ milestone, index, isLast }) => {
    const { title, subtitle, status, progress, units } = milestone;

    const statusConfig = {
        completed: {
            icon: CheckCircle,
            color: 'bg-brand-primary',
            borderColor: 'border-brand-primary',
            textColor: 'text-brand-primary',
            label: 'SECURED',
            iconBg: 'bg-brand-primary'
        },
        active: {
            icon: Loader2,
            color: 'bg-brand-primary',
            borderColor: 'border-brand-primary',
            textColor: 'text-brand-primary',
            label: 'ACTIVE',
            iconBg: 'bg-brand-primary',
            animate: true
        },
        locked: {
            icon: Lock,
            color: 'bg-brand-bg',
            borderColor: 'border-brand-border',
            textColor: 'text-brand-muted',
            label: 'LOCKED',
            iconBg: 'bg-brand-bg'
        }
    };

    const config = statusConfig[status] || statusConfig.locked;
    const Icon = config.icon;

    return (
        <div className="relative">
            {/* Connecting Line */}
            {!isLast && (
                <div className="absolute left-[35px] top-[70px] w-[2px] h-[calc(100%+24px)] bg-[#1F1F1F]" />
            )}

            {/* Milestone */}
            <div className="flex items-start gap-6">
                {/* Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`relative z-10 w-[70px] h-[70px] rounded-2xl ${config.iconBg} border-4 border-brand-surface flex items-center justify-center flex-shrink-0 shadow-premium`}
                >
                    <Icon
                        className={`w-8 h-8 text-white ${config.animate ? 'animate-spin' : ''}`}
                    />
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 + 0.1 }}
                    className={`flex-1 bg-brand-surface rounded-2xl border ${config.borderColor} p-6 transition-all ${status === 'locked' ? 'opacity-50' : ''
                        }`}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <h3 className="text-brand-text font-black text-xl uppercase italic tracking-tight transition-colors">
                                {title}
                            </h3>
                            <p className="text-brand-muted text-sm font-bold uppercase tracking-wider mt-1 transition-colors">
                                {subtitle}
                            </p>
                        </div>
                        <span className={`${config.textColor} text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-brand-bg/50 transition-colors`}>
                            {config.label}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    {status === 'active' && progress !== undefined && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-brand-muted text-xs font-black uppercase tracking-widest transition-colors">
                                    Progress
                                </span>
                                <span className="text-brand-primary text-sm font-black transition-colors">
                                    {progress}% Complete
                                </span>
                            </div>
                            <div className="h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 1, delay: index * 0.1 + 0.2 }}
                                    className="h-full bg-brand-primary shadow-[0_0_10px_var(--color-primary-glow)]"
                                />
                            </div>
                        </div>
                    )}

                    {/* Units Info */}
                    {units && (
                        <p className="text-brand-muted text-xs font-bold mt-3 transition-colors">
                            {units}
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default LearningPathWrapper;
export { LearningJourney, LearningPathWrapper as LearningPath };
