import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2, CheckCircle, Star } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Certificate = ({
    studentName,
    courseName,
    completionDate,
    instructorName,
    courseId,
    certificateId,
    grade = 'A+',
    hours = '40'
}) => {
    const certificateRef = useRef(null);

    const downloadCertificate = async () => {
        const element = certificateRef.current;
        const canvas = await html2canvas(element, {
            scale: 2,
            backgroundColor: '#000000',
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Certificate-${courseName.replace(/\s+/g, '-')}.pdf`);
    };

    const shareCertificate = () => {
        if (navigator.share) {
            navigator.share({
                title: 'My Course Certificate',
                text: `I completed ${courseName}!`,
                url: window.location.href
            });
        }
    };

    return (
        <div className="min-h-screen bg-black p-8 flex items-center justify-center">
            <div className="max-w-7xl w-full space-y-8">
                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={downloadCertificate}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-all flex items-center gap-2"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={shareCertificate}
                        className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold uppercase text-sm tracking-wider transition-all flex items-center gap-2"
                    >
                        <Share2 className="w-4 h-4" />
                        Share
                    </motion.button>
                </div>

                {/* Certificate */}
                <motion.div
                    ref={certificateRef}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative bg-gradient-to-br from-[#0D0D0D] via-[#1A1A1A] to-[#0D0D0D] rounded-[3rem] border-4 border-blue-500/20 p-16 overflow-hidden shadow-2xl"
                    style={{ aspectRatio: '16/11' }}
                >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-5">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.3) 1px, transparent 0)`,
                            backgroundSize: '40px 40px'
                        }} />
                    </div>

                    {/* Corner Decorations */}
                    <div className="absolute top-8 left-8 w-24 h-24 border-t-4 border-l-4 border-blue-500/50 rounded-tl-3xl" />
                    <div className="absolute top-8 right-8 w-24 h-24 border-t-4 border-r-4 border-blue-500/50 rounded-tr-3xl" />
                    <div className="absolute bottom-8 left-8 w-24 h-24 border-b-4 border-l-4 border-blue-500/50 rounded-bl-3xl" />
                    <div className="absolute bottom-8 right-8 w-24 h-24 border-b-4 border-r-4 border-blue-500/50 rounded-br-3xl" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-between text-center">
                        {/* Header */}
                        <div className="space-y-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring' }}
                                className="inline-block"
                            >
                                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/50">
                                    <Award className="w-12 h-12 text-white" />
                                </div>
                            </motion.div>
                            <div>
                                <h1 className="text-5xl font-black text-white uppercase italic tracking-tight mb-2">
                                    Certificate
                                </h1>
                                <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.3em]">
                                    Of Completion
                                </p>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="space-y-8 max-w-3xl">
                            <p className="text-zinc-400 text-lg font-bold uppercase tracking-widest">
                                This is to certify that
                            </p>

                            <div className="relative">
                                <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 uppercase italic">
                                    {studentName}
                                </h2>
                                <div className="mt-4 h-1 w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                            </div>

                            <p className="text-zinc-400 text-lg font-bold uppercase tracking-widest">
                                has successfully completed
                            </p>

                            <div className="bg-black/50 rounded-3xl border border-blue-500/30 p-8 backdrop-blur-sm">
                                <h3 className="text-4xl font-black text-white uppercase italic mb-4">
                                    {courseName}
                                </h3>
                                <div className="flex items-center justify-center gap-8 text-zinc-500">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                        <span className="font-bold uppercase text-sm tracking-wider">
                                            {hours} Hours
                                        </span>
                                    </div>
                                    <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                                    <div className="flex items-center gap-2">
                                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                        <span className="font-bold uppercase text-sm tracking-wider">
                                            Grade: {grade}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="w-full flex items-end justify-between">
                            <div className="text-left space-y-2">
                                <div className="h-0.5 w-48 bg-gradient-to-r from-blue-500 to-transparent mb-3" />
                                <p className="text-white font-black text-xl uppercase italic">
                                    {instructorName}
                                </p>
                                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">
                                    Course Instructor
                                </p>
                            </div>

                            <div className="text-center space-y-2">
                                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">
                                    Completion Date
                                </p>
                                <p className="text-white font-black text-lg uppercase">
                                    {new Date(completionDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>

                            <div className="text-right space-y-2">
                                <div className="h-0.5 w-48 bg-gradient-to-l from-blue-500 to-transparent mb-3 ml-auto" />
                                <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">
                                    Certificate ID
                                </p>
                                <p className="text-zinc-500 font-mono text-sm">
                                    {certificateId || `CERT-${courseId.slice(-8).toUpperCase()}`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Glow Effects */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                </motion.div>

                {/* Certificate Info */}
                <div className="bg-[#0D0D0D] rounded-3xl border border-[#1F1F1F] p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-6 bg-black/50 rounded-2xl border border-blue-500/10">
                            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
                            <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                                Status
                            </p>
                            <p className="text-white font-black text-lg uppercase">
                                Verified
                            </p>
                        </div>
                        <div className="text-center p-6 bg-black/50 rounded-2xl border border-blue-500/10">
                            <Award className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                            <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                                Credential
                            </p>
                            <p className="text-white font-black text-lg uppercase">
                                Official
                            </p>
                        </div>
                        <div className="text-center p-6 bg-black/50 rounded-2xl border border-blue-500/10">
                            <Star className="w-8 h-8 text-amber-500 fill-amber-500 mx-auto mb-3" />
                            <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-2">
                                Achievement
                            </p>
                            <p className="text-white font-black text-lg uppercase">
                                Unlocked
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
