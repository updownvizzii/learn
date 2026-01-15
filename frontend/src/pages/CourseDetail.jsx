import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Lock,
    CheckCircle,
    Smartphone,
    Award,
    Globe,
    Clock,
    Star,
    Users,
    Calendar,
    ChevronDown,
    ChevronUp,
    MessageCircle,
    Share2,
    Heart,
    Loader2
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [openSection, setOpenSection] = useState(0);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');

                // Fetch course details
                const courseRes = await axios.get(`${API_URL}/courses/${id}`);
                setCourse(courseRes.data);

                // Check enrollment if logged in
                if (token) {
                    try {
                        const enrolledRes = await axios.get(`${API_URL}/courses/enrolled`);
                        const enrolledCourses = enrolledRes.data;
                        if (Array.isArray(enrolledCourses)) {
                            setIsEnrolled(enrolledCourses.some(c => c._id === id));
                        }
                    } catch (err) {
                        if (err.response?.status === 401) {
                            // Session expired, just treat as not enrolled
                            setIsEnrolled(false);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourseData();
    }, [id]);

    const handleEnroll = async () => {
        if (isEnrolled) {
            alert('You are already enrolled in this course.');
            return;
        }

        setIsEnrolling(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                alert('Please login to enroll in this course.');
                navigate('/login');
                return;
            }

            const response = await axios.post(`${API_URL}/courses/${id}/enroll`);
            if (response.status === 200 || response.status === 201) {
                setIsEnrolled(true);
                alert('🎉 Successfully enrolled! You can now access all course videos.');
                // Refresh the page to show unlocked content
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        } catch (error) {
            console.error('Enrollment error:', error);
            const message = error.response?.data?.message || 'Enrollment failed. Please try again.';
            alert(message);
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleVideoClick = async (e, lec, isEnrolled) => {
        if (!isEnrolled) {
            e.preventDefault();
            alert('Please enroll in this course to access the videos.');
            return;
        }

        // For Cloudflare Stream videos (UIDs), fetch playback URL
        if (lec.video && !lec.video.startsWith('http')) {
            e.preventDefault();
            try {
                // Show loading state if needed
                const response = await axios.get(`${API_URL}/courses/${id}/video/${lec.video}`);
                const { iframeUrl } = response.data;
                // Open video in new window with Cloudflare Stream player
                window.open(iframeUrl, '_blank', 'width=1280,height=720');
            } catch (error) {
                console.error('Error fetching video:', error);
                alert('Failed to load video. Please try again.');
            }
        }
        // If it's a direct URL (shouldn't happen with new uploads but for legacy/external), let default behavior handle it
    };

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? -1 : index);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Loading course details...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h2>
                <p className="text-gray-500 mb-6">The course you're looking for doesn't exist or has been removed.</p>
                <button onClick={() => navigate('/courses')} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Browse Other Courses</button>
            </div>
        );
    }

    // Features fallback (if missing in DB)
    const features = course.features || [
        'Full lifetime access',
        'Access on mobile and TV',
        'Certificate of completion',
        '10+ downloadable resources'
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 pb-20">
            {/* Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <button onClick={() => navigate('/courses')} className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    Back to Courses
                </button>
                <div className="flex gap-4">
                    <button className="p-2 text-gray-500 hover:text-red-500 transition-colors"><Heart className="w-5 h-5" /></button>
                    <button className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"><Share2 className="w-5 h-5" /></button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 relative z-10">

                {/* Hero Section */}
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start mb-12">
                    <div className="flex-1 space-y-6">
                        <div className="flex items-center space-x-2 text-sm font-bold tracking-wide text-indigo-600 uppercase bg-indigo-50 px-3 py-1 rounded-full w-fit">
                            <span>{course.category}</span>
                        </div>

                        <h1 className="text-4xl md:text-5xl font-extrabold pb-2 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 leading-tight">
                            {course.title}
                        </h1>

                        {course.subtitle && (
                            <p className="text-xl text-gray-700 font-medium leading-relaxed">
                                {course.subtitle}
                            </p>
                        )}

                        <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                            {course.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                                <span className="font-bold text-yellow-600 mr-1">{course.rating || '0'}</span>
                                <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-4 h-4 ${i < (course.rating || 0) ? 'fill-current' : ''}`} />
                                    ))}
                                </div>
                                <span className="ml-2 text-gray-500">({(course.numReviews || 0).toLocaleString()})</span>
                            </div>
                            <span className="flex items-center gap-1"><Users className="w-4 h-4 text-indigo-500" /> {(course.students?.length || 0).toLocaleString()} students</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4 text-indigo-500" /> Last updated {new Date(course.updatedAt).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1"><Globe className="w-4 h-4 text-indigo-500" /> {course.language || 'English'}</span>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur rounded-2xl border border-gray-100 w-fit">
                            <img
                                src={course.instructor?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.username}`}
                                alt={course.instructor?.username}
                                className="w-12 h-12 rounded-full ring-2 ring-indigo-100"
                                onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.username}`; }}
                            />
                            <div>
                                <p className="text-sm text-gray-500">Created by</p>
                                <span className="font-bold text-indigo-600">{course.instructor?.username || 'Unknown Instructor'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:block w-[400px] flex-shrink-0">
                        {/* Placeholder for sticky space */}
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1">
                        {/* Mobile Video Preview */}
                        <div className="block lg:hidden mb-8">
                            <div className="aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative group cursor-pointer">
                                <img
                                    src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${API_URL.replace('/api', '')}${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80'}
                                    className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                                    alt="Course Preview"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80'; }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                        <Play className="w-8 h-8 fill-current" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="sticky top-[72px] bg-[#f8fafc]/90 backdrop-blur z-20 pt-2 border-b border-gray-200">
                            <nav className="-mb-px flex space-x-8">
                                {['Overview', 'Curriculum', 'Instructor'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`
                                            whitespace-nowrap py-4 px-1 border-b-2 font-bold text-sm transition-all
                                            ${activeTab === tab.toLowerCase()
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                        `}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="py-8 space-y-10 min-h-[500px]">
                            {activeTab === 'overview' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(course.learningObjectives?.length > 0 ? course.learningObjectives : ['Master the fundamentals', 'Build real-world projects', 'Learn industry best practices']).map((item, i) => (
                                                <div key={i} className="flex items-start gap-3">
                                                    <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                                    <span className="text-gray-700 font-medium">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {course.requirements?.length > 0 && (
                                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h3>
                                            <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium">
                                                {course.requirements.map((req, i) => (
                                                    <li key={i}>{req}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {course.targetAudience?.length > 0 && (
                                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Who this course is for:</h3>
                                            <ul className="list-disc list-inside space-y-2 text-gray-700 font-medium">
                                                {course.targetAudience.map((audience, i) => (
                                                    <li key={i}>{audience}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Description</h3>
                                        <div className="prose prose-indigo text-gray-600 max-w-none">
                                            <p>{course.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'curriculum' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <div className="flex justify-between items-center mb-4 text-gray-600 font-medium">
                                        <p>
                                            {course.sections?.length || 0} sections • {course.sections?.reduce((acc, curr) => acc + (curr.lectures?.length || 0), 0) || 0} lectures
                                        </p>
                                    </div>

                                    {course.sections?.map((section, idx) => (
                                        <div key={idx} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                            <button
                                                onClick={() => toggleSection(idx)}
                                                className="w-full bg-gray-50/50 px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex items-center gap-4 text-left">
                                                    {openSection === idx ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                                                    <span className="font-bold text-gray-900 text-lg">{section.title}</span>
                                                </div>
                                                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">{section.lectures?.length || 0} lectures</span>
                                            </button>

                                            <AnimatePresence>
                                                {openSection === idx && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="divide-y divide-gray-100 border-t border-gray-100">
                                                            {section.lectures?.map((lec, lIdx) => (
                                                                <div key={lIdx} className="px-6 py-4 flex items-center justify-between hover:bg-indigo-50/30 transition-colors group">
                                                                    <div className="flex items-center gap-3 flex-1">
                                                                        {isEnrolled ? (
                                                                            <Play className="h-4 w-4 text-indigo-500 fill-current flex-shrink-0" />
                                                                        ) : (
                                                                            <Lock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                                                        )}
                                                                        <button
                                                                            onClick={(e) => handleVideoClick(e, lec, isEnrolled)}
                                                                            className={`text-gray-700 font-medium group-hover:text-indigo-600 transition-colors flex-1 text-left ${isEnrolled ? 'cursor-pointer hover:underline' : 'cursor-not-allowed opacity-60'
                                                                                }`}
                                                                            disabled={!isEnrolled}
                                                                        >
                                                                            {lec.title}
                                                                            {isEnrolled && (
                                                                                <span className="ml-2 text-xs text-emerald-600 font-bold">▶ Watch Now</span>
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                    <span className="text-sm text-gray-400">{lec.duration || 'Video'}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </motion.div>
                            )}

                            {activeTab === 'instructor' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                        <img
                                            src={course.instructor?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.username}`}
                                            alt={course.instructor?.username}
                                            className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
                                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.username}`; }}
                                        />
                                        <div className="flex-1 space-y-4 text-center md:text-left">
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">{course.instructor?.username || 'Unknown Instructor'}</h3>
                                                <p className="text-indigo-600 font-bold">{course.instructor?.expertise || 'Course Instructor'}</p>
                                            </div>
                                            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-500 font-bold">
                                                <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500" /> 4.8 Instructor Rating</div>
                                                <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-indigo-500" /> 2,456 Reviews</div>
                                                <div className="flex items-center gap-2"><Users className="w-4 h-4 text-emerald-500" /> {(course.students?.length || 0).toLocaleString()} Students</div>
                                                <div className="flex items-center gap-2"><Play className="w-4 h-4 text-purple-500" /> 12 Courses</div>
                                            </div>
                                            <p className="text-gray-600 leading-relaxed text-sm">{course.instructor?.bio || 'An experienced developer and educator passionate about sharing knowledge.'}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Sticky Sidebar */}
                    <div className="lg:w-[400px] relative">
                        <div className="sticky top-24 space-y-6">
                            <div className="hidden lg:block aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl relative group cursor-pointer ring-4 ring-white">
                                <img
                                    src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${API_URL.replace('/api', '')}${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80'}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    alt="Course Preview"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80'; }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                                        <Play className="w-8 h-8 fill-current" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 text-center lg:text-left">
                                <div className="mb-6">
                                    <span className="text-4xl font-extrabold text-gray-900 tracking-tight">
                                        {course.isFree ? (
                                            <span className="text-emerald-600">Free</span>
                                        ) : (
                                            `${course.currency || 'INR'} ${course.price}`
                                        )}
                                    </span>
                                </div>

                                <button
                                    onClick={handleEnroll}
                                    disabled={isEnrolling || isEnrolled}
                                    className={`w-full py-4 ${isEnrolled ? 'bg-emerald-500' : 'bg-indigo-600'} text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg transform hover:-translate-y-1 mb-4 disabled:opacity-70 disabled:cursor-not-allowed`}
                                >
                                    {isEnrolling ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Enrolling...
                                        </span>
                                    ) : isEnrolled ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Enrolled - Access Videos Below
                                        </span>
                                    ) : (
                                        `Enroll Now${course.isFree ? ' - Free' : ''}`
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-400 mb-8 font-medium">30-Day Money-Back Guarantee • Full Lifetime Access</p>

                                <div className="space-y-4 text-left">
                                    <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider">This course includes:</h4>
                                    <ul className="space-y-3">
                                        {features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-sm text-gray-600 font-medium">
                                                <div className="w-6 flex justify-center mr-2"><CheckCircle className="h-4 w-4 text-indigo-500" /></div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between gap-4">
                                    <button className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors">Share</button>
                                    <button className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors">Gift</button>
                                    <button className="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors">Apply Coupon</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
