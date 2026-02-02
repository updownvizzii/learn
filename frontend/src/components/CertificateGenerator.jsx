import React from 'react';
import { jsPDF } from 'jspdf';
import { Award } from 'lucide-react';

/**
 * Modern Course-Specific Certificate Generator
 * Creates a clean, minimalist certificate focused on course content
 */
export const generateEnhancedCertificate = async (data) => {
    try {
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [842, 595] // A4 Landscape
        });

        // Clean white background
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 842, 595, 'F');

        // Modern accent color bar at top (course category color)
        const categoryColors = {
            'Programming': { r: 99, g: 102, b: 241 },      // Indigo
            'Design': { r: 236, g: 72, b: 153 },           // Pink
            'Business': { r: 16, g: 185, b: 129 },         // Emerald
            'Marketing': { r: 245, g: 158, b: 11 },        // Amber
            'Data Science': { r: 139, g: 92, b: 246 },     // Purple
            'default': { r: 99, g: 102, b: 241 }           // Default indigo
        };

        const category = data.category || 'default';
        const color = categoryColors[category] || categoryColors.default;

        // Top accent bar
        doc.setFillColor(color.r, color.g, color.b);
        doc.rect(0, 0, 842, 12, 'F');

        // Subtle left sidebar
        doc.setFillColor(248, 250, 252);
        doc.rect(0, 12, 180, 583, 'F');

        // Vertical course category badge on sidebar
        doc.setFillColor(color.r, color.g, color.b);
        doc.roundedRect(40, 80, 100, 140, 12, 12, 'F');

        // Category icon/emoji
        doc.setFontSize(48);
        doc.text('📚', 90, 130, { align: 'center' });

        // Category text
        doc.setFontSize(14);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text(category.toUpperCase(), 90, 180, { align: 'center' });

        // Course stats on sidebar
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');

        // Completion date
        const dateStr = new Date(data.completionDate).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        });
        doc.text('COMPLETED', 90, 280, { align: 'center' });
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(71, 85, 105);
        doc.text(dateStr, 90, 300, { align: 'center' });

        // Certificate ID at bottom of sidebar
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'normal');
        doc.text('Certificate ID', 90, 520, { align: 'center' });
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(data.uniqueId.substring(0, 12), 90, 535, { align: 'center' });

        // Main content area
        // Modern "CERTIFICATE" header
        doc.setFontSize(16);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICATE OF ACHIEVEMENT', 511, 100, { align: 'center' });

        // Thin accent line
        doc.setLineWidth(2);
        doc.setDrawColor(color.r, color.g, color.b);
        doc.line(340, 115, 682, 115);

        // Student name - Large and prominent
        doc.setFontSize(48);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(data.studentName, 511, 180, { align: 'center' });

        // Completion text
        doc.setFontSize(14);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('has successfully completed', 511, 220, { align: 'center' });

        // Course name - Prominent and bold
        doc.setFontSize(32);
        doc.setTextColor(color.r, color.g, color.b);
        doc.setFont('helvetica', 'bold');

        // Handle long course names
        const maxWidth = 450;
        const courseNameLines = doc.splitTextToSize(data.courseName, maxWidth);
        const courseNameY = 270;

        if (courseNameLines.length === 1) {
            doc.text(courseNameLines[0], 511, courseNameY, { align: 'center' });
        } else {
            doc.text(courseNameLines[0], 511, courseNameY - 15, { align: 'center' });
            doc.text(courseNameLines[1], 511, courseNameY + 15, { align: 'center' });
        }

        // Course description/subtitle if available
        if (data.courseSubtitle) {
            doc.setFontSize(12);
            doc.setTextColor(100, 116, 139);
            doc.setFont('helvetica', 'italic');
            const subtitleLines = doc.splitTextToSize(data.courseSubtitle, maxWidth);
            doc.text(subtitleLines[0], 511, 330, { align: 'center' });
        }

        // Skills/Topics learned (if available)
        if (data.skills && data.skills.length > 0) {
            doc.setFontSize(10);
            doc.setTextColor(71, 85, 105);
            doc.setFont('helvetica', 'normal');
            doc.text('Key Skills Mastered:', 280, 380);

            doc.setFont('helvetica', 'bold');
            const skillsText = data.skills.slice(0, 5).join(' • ');
            const skillsLines = doc.splitTextToSize(skillsText, 450);
            doc.text(skillsLines, 280, 400);
        }

        // Instructor signature section
        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('Verified by', 511, 470, { align: 'center' });

        doc.setFontSize(16);
        doc.setTextColor(30, 41, 59);
        doc.setFont('helvetica', 'bold');
        doc.text(data.instructorName, 511, 495, { align: 'center' });

        // Signature line
        doc.setLineWidth(1);
        doc.setDrawColor(203, 213, 225);
        doc.line(430, 505, 592, 505);

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.setFont('helvetica', 'italic');
        doc.text('Course Instructor', 511, 520, { align: 'center' });

        // Footer verification badge
        doc.setFillColor(249, 250, 251);
        doc.roundedRect(680, 540, 140, 35, 6, 6, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.text('✓ Verified Certificate', 750, 555, { align: 'center' });
        doc.text('EduPlatform.com', 750, 568, { align: 'center' });

        // Save the PDF
        doc.save(`${data.courseName.replace(/\s+/g, '_')}_Certificate.pdf`);

        return true;
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw error;
    }
};

// Certificate Preview Component - Modern Design
export const CertificatePreview = ({ studentName, courseName, instructorName, completionDate, uniqueId, category = 'Programming' }) => {
    const categoryColors = {
        'Programming': 'from-indigo-500 to-indigo-600',
        'Design': 'from-pink-500 to-pink-600',
        'Business': 'from-emerald-500 to-emerald-600',
        'Marketing': 'from-amber-500 to-amber-600',
        'Data Science': 'from-purple-500 to-purple-600',
        'default': 'from-indigo-500 to-indigo-600'
    };

    const categoryIcons = {
        'Programming': '💻',
        'Design': '🎨',
        'Business': '💼',
        'Marketing': '📈',
        'Data Science': '📊',
        'default': '📚'
    };

    const gradientClass = categoryColors[category] || categoryColors.default;
    const icon = categoryIcons[category] || categoryIcons.default;

    return (
        <div className="relative w-full aspect-[842/595] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Top accent bar */}
            <div className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${gradientClass}`}></div>

            {/* Left sidebar */}
            <div className="absolute left-0 top-3 bottom-0 w-44 bg-gray-50">
                {/* Category badge */}
                <div className={`mx-auto mt-16 w-24 h-32 bg-gradient-to-br ${gradientClass} rounded-2xl flex flex-col items-center justify-center text-white shadow-lg`}>
                    <span className="text-4xl mb-2">{icon}</span>
                    <span className="text-xs font-bold text-center px-2">{category.toUpperCase()}</span>
                </div>

                {/* Completion date */}
                <div className="text-center mt-12">
                    <p className="text-xs text-gray-500 font-semibold">COMPLETED</p>
                    <p className="text-sm font-bold text-gray-700 mt-1">
                        {new Date(completionDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                        })}
                    </p>
                </div>

                {/* Certificate ID */}
                <div className="absolute bottom-8 left-0 right-0 text-center">
                    <p className="text-xs text-gray-400">Certificate ID</p>
                    <p className="text-xs font-bold text-gray-600 mt-1">{uniqueId?.substring(0, 12)}</p>
                </div>
            </div>

            {/* Main content */}
            <div className="ml-44 p-12 flex flex-col items-center justify-center h-full">
                {/* Header */}
                <p className="text-sm font-bold text-gray-400 tracking-widest mb-2">CERTIFICATE OF ACHIEVEMENT</p>
                <div className={`w-64 h-0.5 bg-gradient-to-r ${gradientClass} mb-8`}></div>

                {/* Student name */}
                <h2 className="text-5xl font-bold text-gray-900 mb-6">
                    {studentName}
                </h2>

                {/* Completion text */}
                <p className="text-base text-gray-600 mb-6">has successfully completed</p>

                {/* Course name */}
                <h3 className={`text-3xl font-bold bg-gradient-to-r ${gradientClass} bg-clip-text text-transparent text-center mb-8 max-w-lg`}>
                    {courseName}
                </h3>

                {/* Instructor */}
                <div className="mt-auto text-center">
                    <p className="text-sm text-gray-500 mb-2">Verified by</p>
                    <p className="text-lg font-bold text-gray-900">{instructorName}</p>
                    <div className="w-32 h-px bg-gray-300 mx-auto mt-2"></div>
                    <p className="text-xs text-gray-400 italic mt-1">Course Instructor</p>
                </div>

                {/* Verification badge */}
                <div className="absolute bottom-4 right-4 bg-gray-50 rounded-lg px-4 py-2">
                    <p className="text-xs text-gray-600">✓ Verified Certificate</p>
                    <p className="text-xs text-gray-500">EduPlatform.com</p>
                </div>
            </div>
        </div>
    );
};
