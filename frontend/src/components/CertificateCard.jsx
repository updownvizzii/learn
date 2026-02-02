import React from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CertificateCard = ({ course, completionDate, grade = 'A+' }) => {
    const navigate = useNavigate();

    const handleView = () => {
        navigate(`/certificate/${course._id}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] rounded-3xl border-2 border-blue-500/20 p-6 overflow-hidden relative group cursor-pointer"
            onClick={handleView}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }} />
            </div>

            {/* Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-500" />

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <Award className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                <span className="text-amber-500 text-xs font-black uppercase">
                                    {grade}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Course Info */}
                <div className="mb-4">
                    <h3 className="text-white font-black text-xl uppercase italic mb-2 line-clamp-2">
                        {course.title}
                    </h3>
                    <p className="text-zinc-500 text-sm font-bold uppercase tracking-wider">
                        Completed {new Date(completionDate).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric'
                        })}
                    </p>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-zinc-600 text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>Verified</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Official</span>
                    </div>
                </div>

                {/* Action Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleView();
                    }}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-all flex items-center justify-center gap-2 group-hover:shadow-lg group-hover:shadow-blue-500/50"
                >
                    <Eye className="w-4 h-4" />
                    View Certificate
                </motion.button>
            </div>

            {/* Corner Decorations */}
            <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-blue-500/30 rounded-tl-xl" />
            <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-blue-500/30 rounded-br-xl" />
        </motion.div>
    );
};

const CertificateGrid = ({ certificates }) => {
    if (!certificates || certificates.length === 0) {
        return (
            <div className="bg-[#0D0D0D] rounded-3xl border border-[#1F1F1F] p-12 text-center">
                <div className="w-20 h-20 mx-auto bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
                    <Award className="w-10 h-10 text-zinc-600" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase italic mb-2">
                    No Certificates Yet
                </h3>
                <p className="text-zinc-500 font-bold">
                    Complete courses to earn certificates
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, index) => (
                <CertificateCard
                    key={index}
                    course={cert.course}
                    completionDate={cert.completionDate}
                    grade={cert.grade}
                />
            ))}
        </div>
    );
};

export { CertificateCard, CertificateGrid };
export default CertificateCard;
