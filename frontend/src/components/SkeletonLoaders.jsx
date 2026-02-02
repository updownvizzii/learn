import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = () => (
    <div className="bg-[#0D0D0D] rounded-3xl border border-[#1F1F1F] p-6 overflow-hidden">
        <div className="animate-pulse space-y-4">
            <div className="aspect-video bg-zinc-800/50 rounded-2xl shimmer" />
            <div className="space-y-3">
                <div className="h-6 bg-zinc-800/50 rounded-lg w-3/4 shimmer" />
                <div className="h-4 bg-zinc-800/50 rounded-lg w-1/2 shimmer" />
                <div className="flex gap-2 mt-4">
                    <div className="h-8 bg-zinc-800/50 rounded-lg w-20 shimmer" />
                    <div className="h-8 bg-zinc-800/50 rounded-lg w-20 shimmer" />
                </div>
            </div>
        </div>
    </div>
);

export const SkeletonList = ({ count = 3 }) => (
    <div className="space-y-4">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] p-6">
                <div className="animate-pulse flex items-center gap-4">
                    <div className="w-16 h-16 bg-zinc-800/50 rounded-xl shimmer" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-zinc-800/50 rounded-lg w-2/3 shimmer" />
                        <div className="h-4 bg-zinc-800/50 rounded-lg w-1/3 shimmer" />
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#0D0D0D] rounded-2xl border border-[#1F1F1F] p-6">
                <div className="animate-pulse space-y-3">
                    <div className="w-12 h-12 bg-zinc-800/50 rounded-xl shimmer" />
                    <div className="h-8 bg-zinc-800/50 rounded-lg w-1/2 shimmer" />
                    <div className="h-4 bg-zinc-800/50 rounded-lg w-3/4 shimmer" />
                </div>
            </div>
        ))}
    </div>
);

export const SkeletonTable = ({ rows = 5 }) => (
    <div className="bg-[#0D0D0D] rounded-3xl border border-[#1F1F1F] overflow-hidden">
        <div className="p-6 border-b border-[#1F1F1F]">
            <div className="h-6 bg-zinc-800/50 rounded-lg w-1/4 shimmer" />
        </div>
        <div className="divide-y divide-[#1F1F1F]">
            {[...Array(rows)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse flex items-center gap-4">
                    <div className="w-10 h-10 bg-zinc-800/50 rounded-full shimmer" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 bg-zinc-800/50 rounded-lg w-1/3 shimmer" />
                        <div className="h-3 bg-zinc-800/50 rounded-lg w-1/4 shimmer" />
                    </div>
                    <div className="h-8 bg-zinc-800/50 rounded-lg w-20 shimmer" />
                </div>
            ))}
        </div>
    </div>
);

export const SkeletonCourseDetail = () => (
    <div className="space-y-8">
        {/* Hero Skeleton */}
        <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-[3rem] p-12 border border-[#1F1F1F]">
            <div className="animate-pulse space-y-6">
                <div className="h-12 bg-zinc-800/50 rounded-lg w-3/4 shimmer" />
                <div className="h-6 bg-zinc-800/50 rounded-lg w-1/2 shimmer" />
                <div className="flex gap-4">
                    <div className="h-10 bg-zinc-800/50 rounded-xl w-32 shimmer" />
                    <div className="h-10 bg-zinc-800/50 rounded-xl w-32 shimmer" />
                </div>
            </div>
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <SkeletonList count={3} />
            </div>
            <div className="space-y-6">
                <div className="bg-[#0D0D0D] rounded-3xl border border-[#1F1F1F] p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="aspect-video bg-zinc-800/50 rounded-2xl shimmer" />
                        <div className="h-12 bg-zinc-800/50 rounded-xl w-full shimmer" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md', className = '' }) => {
    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div
                className={`${sizes[size]} border-4 border-blue-500/20 border-t-blue-500 rounded-full`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
        </div>
    );
};

// Full Page Loader
export const PageLoader = () => (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
            <LoadingSpinner size="xl" />
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Loading...</p>
        </div>
    </div>
);

export default {
    SkeletonCard,
    SkeletonList,
    SkeletonStats,
    SkeletonTable,
    SkeletonCourseDetail,
    LoadingSpinner,
    PageLoader
};
