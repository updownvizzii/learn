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
    Video,
    BookOpen,
    ArrowLeft,
    Loader2,
    FileText
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

import { generateEnhancedCertificate } from '../components/CertificateGenerator';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../components/GamificationProvider';

const CourseDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const { handleGamificationResult } = useGamification();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [openSection, setOpenSection] = useState(0);
    const [completedLectures, setCompletedLectures] = useState([]);
    const [isCourseCompleted, setIsCourseCompleted] = useState(false);
    const [currentLecture, setCurrentLecture] = useState(null);
    const [showCaptions, setShowCaptions] = useState(true);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('accessToken');
                const courseRes = await axios.get(`${API_URL}/courses/${id}`);
                setCourse(courseRes.data);

                if (token) {
                    try {
                        const enrolledRes = await axios.get(`${API_URL}/courses/enrolled`);
                        const enrolledCourses = enrolledRes.data;
                        if (Array.isArray(enrolledCourses)) {
                            const enrollment = enrolledCourses.find(c => c._id === id);
                            if (enrollment) {
                                setIsEnrolled(true);
                                setCompletedLectures(enrollment.completedLectures || []);
                                setIsCourseCompleted(enrollment.isCompleted || false);
                            }
                        }
                    } catch (err) {
                        if (err.response?.status === 401) setIsEnrolled(false);
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
        if (isEnrolled) return;
        setIsEnrolling(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                navigate('/login');
                return;
            }
            const response = await axios.post(`${API_URL}/courses/${id}/enroll`);
            if (response.status === 200 || response.status === 201) {
                setIsEnrolled(true);
                window.location.reload();
            }
        } catch (error) {
            console.error('Enrollment error:', error);
        } finally {
            setIsEnrolling(false);
        }
    };


    const handleVideoClick = async (e, lec, isEnrolled) => {
        if (!isEnrolled) {
            e.preventDefault();
            return;
        }
        if (lec.video) {
            e.preventDefault();
            setSelectedLecture(lec);
            // Scroll to top to show video player
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const toggleLectureCompletion = async (lectureId) => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(`${API_URL}/courses/${id}/lectures/${lectureId}/complete`, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setCompletedLectures(response.data.completedLectures);
                setIsCourseCompleted(response.data.isCompleted);

                // Handle Gamification Result
                if (response.data.gamification) {
                    const { lectureXP, courseXP, achievement } = response.data.gamification;
                    if (lectureXP) handleGamificationResult(lectureXP);
                    if (courseXP) handleGamificationResult(courseXP);
                    if (achievement) handleGamificationResult({ achievement });
                }
            }
        } catch (error) {
            console.error("Error marking lecture as complete:", error);
        }
    };

    const downloadCertificate = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const res = await axios.get(`${API_URL}/courses/${id}/certificate`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await generateEnhancedCertificate(res.data);
        } catch (error) {
            console.error("Error generating certificate:", error);
        }
    };

    const toggleSection = (index) => {
        setOpenSection(openSection === index ? -1 : index);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg transition-colors">
                <Loader2 className="h-16 w-16 text-brand-primary animate-spin mb-8" />
                <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[10px]">Syncing Intelligence...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-brand-bg transition-colors">
                <h2 className="text-3xl font-black text-brand-text italic tracking-tighter uppercase mb-6 transition-colors">Sector Lost</h2>
                <button onClick={() => navigate('/courses')} className="px-10 py-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-brand-primary/90 transition-all shadow-premium">Return to Grid</button>
            </div>
        );
    }

    const features = course.features || ['Elite Clearance', 'Sync Across Devices', 'Verified Status', 'Resource Downlink'];

    return (
        <div className="min-h-screen bg-brand-bg font-jakarta text-brand-text relative overflow-hidden transition-colors">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 dark:bg-blue-600/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/5 dark:bg-blue-900/5 rounded-full blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-brand-surface/60 backdrop-blur-2xl border-b border-brand-border px-10 h-24 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-6">
                    <Link to="/courses" className="p-3 bg-brand-surface border border-brand-border rounded-xl hover:text-brand-primary hover:border-brand-primary/50 transition-all text-brand-muted">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-black text-brand-text italic tracking-tighter uppercase transition-colors">INTEL_STREAM</h1>
                        <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest transition-colors">Session: Active</p>
                    </div>
                </div>
                <div className="flex gap-8 items-center">
                    <button className="text-brand-muted hover:text-brand-primary transition-colors"><Heart className="w-5 h-5" /></button>
                    <button className="text-brand-muted hover:text-brand-primary transition-colors"><Share2 className="w-5 h-5" /></button>

                    {user ? (
                        <div
                            onClick={() => navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')}
                            className="w-10 h-10 rounded-xl overflow-hidden border border-brand-border bg-brand-bg hover:border-brand-primary/40 transition-all cursor-pointer"
                        >
                            <img src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-brand-primary text-white rounded-xl hover:bg-brand-primary/80 transition-all shadow-premium">Join Grid</button>
                    )}
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Current Operator</p>
                            <p className="text-xs font-black text-brand-primary uppercase italic tracking-tighter transition-colors">Verified Student</p>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black shadow-premium transition-all">
                            S
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Side: Video Content */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Video Player Section */}
                        <div className="aspect-video bg-brand-surface rounded-[2.5rem] border border-brand-border overflow-hidden shadow-premium dark:shadow-premium-dark relative group transition-all">
                            {currentLecture ? (
                                <div className="w-full h-full relative">
                                    <video
                                        key={currentLecture.video}
                                        src={currentLecture.video}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                    />
                                    <div className="absolute top-8 left-8">
                                        <div className="px-5 py-2.5 bg-brand-primary/20 backdrop-blur-xl border border-brand-primary/30 rounded-2xl">
                                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.2em] transition-colors">{currentLecture.title}</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center space-y-6">
                                    <div className="w-20 h-20 rounded-3xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                        <Video className="w-10 h-10" />
                                    </div>
                                    <p className="text-brand-muted font-black uppercase tracking-widest text-xs">Awaiting Command Input</p>
                                </div>
                            )}
                        </div>

                        {/* Current Lecture Info */}
                        <div className="bg-brand-surface rounded-[2.5rem] border border-brand-border p-10 shadow-premium transition-all">
                            <div className="flex items-center justify-between mb-8">
                                <h1 className="text-3xl font-black text-brand-text italic tracking-tighter uppercase transition-colors">
                                    {currentLecture?.title || course.title}
                                </h1>
                                <div className="flex items-center gap-3 px-4 py-2 bg-brand-primary/10 rounded-xl border border-brand-primary/20 text-brand-primary">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">{currentLecture?.duration || '10:00'}</span>
                                </div>
                            </div>
                            <p className="text-brand-muted leading-relaxed font-bold transition-colors">
                                {course.description}
                            </p>
                        </div>
                        {/* Tabs */}
                        <div className="sticky top-24 bg-brand-bg/80 backdrop-blur-2xl z-20 pt-4 border-b border-brand-border mb-12 transition-colors">
                            <nav className="flex space-x-12">
                                {['Overview', 'Curriculum', 'Instructor'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab.toLowerCase())}
                                        className={`
                                            whitespace-nowrap py-6 font-black text-[11px] uppercase tracking-[0.3em] transition-all relative
                                            ${activeTab === tab.toLowerCase()
                                                ? 'text-brand-primary'
                                                : 'text-brand-muted hover:text-brand-text'}
                                        `}
                                    >
                                        {tab}
                                        {activeTab === tab.toLowerCase() && (
                                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary shadow-premium" />
                                        )}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="min-h-[600px]">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                                        <div className="bg-brand-surface rounded-[2.5rem] p-10 border border-brand-border shadow-2xl relative overflow-hidden group transition-all">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[50px] group-hover:bg-brand-primary/10 transition-all" />
                                            <h3 className="text-2xl font-black text-brand-text mb-8 uppercase italic tracking-tighter">Strategic Objectives</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {(course.learningObjectives?.length > 0 ? course.learningObjectives : ['Establish high-level protocol mastery', 'Execute complex domain shifts', 'Secure verified expertise status']).map((item, i) => (
                                                    <div key={i} className="flex items-start gap-4">
                                                        <CheckCircle className="h-5 w-5 text-brand-primary flex-shrink-0 mt-1" />
                                                        <span className="text-brand-muted font-bold text-sm leading-relaxed uppercase tracking-tight">{item}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {course.requirements?.length > 0 && (
                                                <div className="bg-brand-surface rounded-[2rem] p-10 border border-brand-border transition-all">
                                                    <h3 className="text-xl font-black text-brand-text mb-6 uppercase italic">Entry Prerequisites</h3>
                                                    <ul className="space-y-4">
                                                        {course.requirements.map((req, i) => (
                                                            <li key={i} className="flex items-center gap-3 text-brand-muted font-bold text-xs uppercase tracking-tight">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                                                {req}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {course.targetAudience?.length > 0 && (
                                                <div className="bg-brand-surface rounded-[2rem] p-10 border border-brand-border">
                                                    <h3 className="text-xl font-black text-brand-text mb-6 uppercase italic">Intended Operators</h3>
                                                    <ul className="space-y-4">
                                                        {course.targetAudience.map((audience, i) => (
                                                            <li key={i} className="flex items-center gap-3 text-brand-muted font-bold text-xs uppercase tracking-tight">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
                                                                {audience}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-brand-surface rounded-[2.5rem] p-10 border border-brand-border transition-all">
                                            <h3 className="text-2xl font-black text-brand-text mb-6 uppercase italic tracking-tighter">Intel Abstract</h3>
                                            <div className="text-brand-muted font-medium text-lg leading-relaxed whitespace-pre-line">
                                                {course.description}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'curriculum' && (
                                    <motion.div key="curriculum" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                        <div className="flex justify-between items-end mb-8">
                                            <div>
                                                <h3 className="text-3xl font-black text-brand-text uppercase italic tracking-tighter">Operational Map</h3>
                                                <p className="text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] mt-2">
                                                    {course.sections?.length || 0} SECTORS • {course.sections?.reduce((acc, curr) => acc + (curr.lectures?.length || 0), 0) || 0} DEPLOYMENTS
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-brand-primary font-black text-[10px] uppercase tracking-widest mb-1">Clearance Progress</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-48 h-1.5 bg-brand-border rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${Math.round((completedLectures.length / Math.max(1, course.sections?.reduce((a, c) => a + (c.lectures?.length || 0), 0))) * 100)}%` }}
                                                            className="h-full bg-brand-primary shadow-premium"
                                                        />
                                                    </div>
                                                    <span className="text-brand-text font-black text-sm">{Math.round((completedLectures.length / Math.max(1, course.sections?.reduce((a, c) => a + (c.lectures?.length || 0), 0))) * 100)}%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            {course.sections?.map((section, idx) => (
                                                <div key={idx} className="bg-brand-surface rounded-[2rem] border border-brand-border overflow-hidden group">
                                                    <div
                                                        className="flex items-center justify-between p-8 cursor-pointer hover:bg-brand-bg transition-colors"
                                                        onClick={() => toggleSection(idx)}
                                                    >
                                                        <div className="flex items-center gap-6">
                                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm border ${openSection === idx ? 'bg-brand-primary border-brand-primary text-white shadow-premium' : 'bg-brand-bg border-brand-border text-brand-muted'}`}>
                                                                {idx + 1}
                                                            </div>
                                                            <h3 className="font-black text-xl text-brand-text uppercase italic tracking-tight">{section.title}</h3>
                                                        </div>
                                                        {openSection === idx ? <ChevronUp className="w-5 h-5 text-brand-muted" /> : <ChevronDown className="w-5 h-5 text-brand-muted" />}
                                                    </div>

                                                    <AnimatePresence>
                                                        {openSection === idx && (
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: 'auto' }}
                                                                exit={{ height: 0 }}
                                                                className="border-t border-brand-border px-8 pb-8 pt-4 space-y-3"
                                                            >
                                                                {section.lectures?.map((lec, lIdx) => {
                                                                    const lectureId = lec._id;
                                                                    const isCompleted = completedLectures.includes(lectureId);

                                                                    return (
                                                                        <div key={lIdx} className="bg-brand-bg p-5 rounded-2xl border border-brand-border flex items-center justify-between group/lec hover:border-brand-primary/30 transition-all">
                                                                            <div className="flex items-center gap-5 flex-1">
                                                                                <button
                                                                                    onClick={() => isEnrolled && toggleLectureCompletion(lectureId)}
                                                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${isCompleted ? 'bg-brand-primary border-brand-primary text-white shadow-premium' : 'border-brand-border text-transparent hover:border-brand-primary/50'}`}
                                                                                >
                                                                                    <CheckCircle className="w-4 h-4" />
                                                                                </button>

                                                                                <div
                                                                                    className="flex-1 cursor-pointer"
                                                                                    onClick={(e) => setCurrentLecture(lec)}
                                                                                >
                                                                                    <h4 className={`font-bold text-brand-text uppercase tracking-tight group-hover/lec:text-brand-primary transition-colors text-sm ${!isEnrolled && 'opacity-40'}`}>{lec.title}</h4>
                                                                                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-brand-muted mt-2">
                                                                                        {lec.video ? <Play className="w-3 h-3 text-brand-primary" /> : <Lock className="w-3 h-3" />}
                                                                                        <span>{lec.duration || 'SECURE DATA'}</span>
                                                                                        {lec.transcriptionStatus === 'completed' && (
                                                                                            <span className="flex items-center gap-1 text-emerald-500">
                                                                                                <FileText className="w-3 h-3" />
                                                                                                TRANSCRIBED
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Show transcript if available */}
                                                                                    {isEnrolled && lec.transcript && (
                                                                                        <div className="mt-3 p-3 bg-brand-bg/50 rounded-lg border border-emerald-500/20">
                                                                                            <div className="flex items-center gap-2 mb-2">
                                                                                                <FileText className="w-4 h-4 text-emerald-500" />
                                                                                                <span className="text-emerald-500 font-bold text-xs uppercase">Transcript</span>
                                                                                            </div>
                                                                                            <p className="text-brand-muted text-xs leading-relaxed max-h-32 overflow-y-auto">
                                                                                                {lec.transcript}
                                                                                            </p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {isEnrolled && lec.video && (
                                                                                <button
                                                                                    onClick={(e) => setCurrentLecture(lec)}
                                                                                    className="px-5 py-2.5 bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-brand-primary hover:text-white transition-all opacity-0 group-hover/lec:opacity-100"
                                                                                >
                                                                                    Initiate
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'instructor' && (
                                    <motion.div key="instructor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-brand-surface rounded-[2.5rem] p-12 border border-brand-border shadow-2xl relative overflow-hidden transition-all">
                                        <div className="flex flex-col md:flex-row items-center md:items-start gap-12">
                                            <div className="relative">
                                                <img
                                                    src={course.instructor?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${course.instructor?.username}`}
                                                    alt={course.instructor?.username}
                                                    className="w-40 h-40 rounded-3xl border border-brand-border shadow-2xl"
                                                />
                                                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center border-4 border-brand-surface">
                                                    <Award className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-6 text-center md:text-left">
                                                <div>
                                                    <h3 className="text-3xl font-black text-brand-text uppercase italic tracking-tighter">{course.instructor?.username || 'Unknown Operator'}</h3>
                                                    <p className="text-brand-primary font-black text-xs uppercase tracking-[0.2em] mt-2">{course.instructor?.expertise || 'Imperial Overseer'}</p>
                                                </div>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-8 text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                                    <div className="flex items-center gap-2"><Star className="w-4 h-4 text-brand-primary fill-current" /> 4.9 Rank</div>
                                                    <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-brand-primary" /> 15k Comms</div>
                                                    <div className="flex items-center gap-2"><Users className="w-4 h-4 text-brand-primary" /> {(course.students?.length || 0).toLocaleString()} Nodes</div>
                                                </div>
                                                <p className="text-brand-muted font-medium leading-relaxed max-w-2xl">{course.instructor?.bio || 'Elite instructor dedicated to high-performance knowledge transfer across global sectors.'}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-[450px] space-y-8">
                        <div className="sticky top-32">
                            <div className="bg-brand-surface p-10 rounded-[3rem] border border-brand-border shadow-2xl relative overflow-hidden glimmer transition-all">
                                <div className="aspect-video bg-brand-bg rounded-3xl border border-brand-border mb-10 overflow-hidden relative group cursor-pointer transition-colors">
                                    <img
                                        src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${API_URL.replace('/api', '')}${course.thumbnail}`) : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'}
                                        alt="Course Preview"
                                        className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-20 h-20 bg-brand-primary/10 backdrop-blur-xl border border-brand-primary/20 rounded-full flex items-center justify-center text-brand-primary group-hover:scale-110 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-premium">
                                            <Play className="w-10 h-10 fill-current ml-2" />
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-10 text-center lg:text-left">
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.3em] mb-3 text-center">Protocol Access Token</p>
                                    <h4 className="text-5xl font-black text-brand-text italic tracking-tighter text-center">
                                        {course.isFree ? <span className="text-brand-primary">OPEN</span> : `${course.price} UNT`}
                                    </h4>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleEnroll}
                                    disabled={isEnrolling || isEnrolled}
                                    className={`w-full py-6 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-[0_0_40px_rgba(37,99,235,0.2)] mb-6 flex items-center justify-center gap-4 ${isEnrolled ? 'bg-zinc-900 text-zinc-500 border border-[#1F1F1F]' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.5)]'}`}
                                >
                                    {isEnrolling ? <Loader2 className="w-5 h-5 animate-spin" /> : isEnrolled ? <><CheckCircle className="w-5 h-5" /> ENROLLED</> : `INITIATE SYNC`}
                                </motion.button>

                                {isCourseCompleted && (
                                    <motion.button
                                        whileHover={{ y: -5 }}
                                        onClick={downloadCertificate}
                                        className="w-full py-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-[0_15px_40px_-10px_rgba(37,99,235,0.5)] flex items-center justify-center gap-4 mb-8"
                                    >
                                        <Award className="w-5 h-5" /> DOWNLOAD CREDS
                                    </motion.button>
                                )}

                                <p className="text-[9px] font-black text-center text-zinc-600 uppercase tracking-widest mb-10">Secured via Imperial AES-256 Downlink</p>

                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] border-b border-[#1F1F1F] pb-4">Syndicate Benefits:</h4>
                                    <ul className="space-y-4">
                                        {features.map((feature, i) => (
                                            <li key={i} className="flex items-center text-[10px] font-black uppercase text-zinc-400 tracking-widest">
                                                <div className="w-6 flex justify-start text-blue-500"><CheckCircle className="h-4 w-4" /></div>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-12 flex items-center justify-center gap-10">
                                    <button className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Transfer</button>
                                    <button className="text-[9px] font-black text-zinc-500 hover:text-white uppercase tracking-widest transition-colors">Voucher</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CourseDetail;
