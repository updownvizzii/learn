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
    FileText,
    Activity,
    Shield,
    MessageSquare,
    Radio,
    Download
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';


const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

import { generateEnhancedCertificate } from '../components/CertificateGenerator';
import { useAuth } from '../contexts/AuthContext';
import { useGamification } from '../components/GamificationProvider';
import CustomVideoPlayer from '../components/CustomVideoPlayer';

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
    const [showMissionStart, setShowMissionStart] = useState(false);
    const [notes, setNotes] = useState('');
    const [questions, setQuestions] = useState([
        { id: 1, user: 'Ghost_Protocol', text: 'Does the AES-256 encryption handshake require a specific entropy seed?', replies: 2, timestamp: '2h ago' },
        { id: 2, user: 'Cipher_Sovereign', text: 'Sector 4 deployment latency is spiking. Any advice on the neural uplink?', replies: 5, timestamp: '5h ago' }
    ]);
    const [newQuestion, setNewQuestion] = useState('');

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

    const [courseVisitCount, setCourseVisitCount] = useState(0);

    useEffect(() => {
        if (!loading && course) {
            const storedVisits = localStorage.getItem(`course_visits_${id}`);
            const newCount = (storedVisits ? parseInt(storedVisits) : 0) + 1;
            localStorage.setItem(`course_visits_${id}`, newCount.toString());
            setCourseVisitCount(newCount);

            setShowMissionStart(true);
            const timer = setTimeout(() => {
                setShowMissionStart(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [loading, course, id]);

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
                    const { lectureXP, courseXP, achievement, streak } = response.data.gamification;
                    if (lectureXP) handleGamificationResult(lectureXP);
                    if (courseXP) handleGamificationResult(courseXP);
                    if (achievement) handleGamificationResult({ achievement });
                    if (streak) handleGamificationResult({ streak });
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
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="min-h-screen flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden"
            >
                {/* Tactical Background */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px' }} />
                </div>

                <div className="relative z-10 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-full border-t-2 border-brand-primary animate-spin mb-10" />
                    <h2 className="text-brand-primary font-black text-4xl uppercase italic tracking-tighter mb-4">
                        Ready To Deploy...
                    </h2>
                    <p className="text-zinc-500 font-black text-xs uppercase tracking-[0.4em]">Establishing Mission Uplink</p>
                </div>
            </motion.div>
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
            {/* Mission Preloader (Course specific) */}
            <AnimatePresence>
                {showMissionStart && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 1 } }}
                        className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-40 h-40 mb-12 relative">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                    className="absolute inset-0 rounded-full border-2 border-dashed border-brand-primary/20"
                                />
                                <div className="absolute inset-4 rounded-full border border-brand-primary/30 flex items-center justify-center bg-brand-surface overflow-hidden">
                                    {course.instructor?.preloaderImage ? (
                                        <img src={course.instructor.preloaderImage} alt="Teacher" className="w-full h-full object-cover" />
                                    ) : (
                                        <Shield className="w-16 h-16 text-brand-primary" />
                                    )}
                                </div>
                            </div>

                            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">
                                {course.instructor?.preloaderText || (courseVisitCount <= 2 ? 'WELCOME' : 'WELCOME BACK')}
                            </h1>
                            <div className="flex items-center gap-4 text-brand-primary font-black text-[10px] uppercase tracking-[0.4em]">
                                <Activity className="w-4 h-4 animate-pulse" />
                                <span>{course.instructor?.preloaderText ? `SECTOR DEPLOYMENT: ${course.instructor?.preloaderText}` : 'Mission Authorization Confirmed'}</span>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                                    <CustomVideoPlayer
                                        src={currentLecture.video.startsWith('http') ? currentLecture.video : `${API_URL.replace('/api', '')}${currentLecture.video}`}
                                        title={currentLecture.title}
                                        transcript={currentLecture.transcript}
                                        onComplete={() => toggleLectureCompletion(currentLecture._id)}
                                    />
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
                                {['Overview', 'Curriculum', 'Instructor', 'Mission Logs', 'Secure Intel', 'Resources'].map((tab) => (
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

                                {activeTab === 'mission logs' && (
                                    <motion.div key="notes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                        <div className="bg-brand-surface rounded-[2.5rem] p-10 border border-brand-border shadow-2xl relative overflow-hidden">
                                            <div className="flex items-center justify-between mb-8">
                                                <div>
                                                    <h3 className="text-2xl font-black text-brand-text uppercase italic tracking-tighter">Tactical Mission Logs</h3>
                                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mt-2">// Recorded during active uplink</p>
                                                </div>
                                                <button
                                                    onClick={() => alert('Mission logs synced to local storage.')}
                                                    className="px-6 py-2.5 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-premium hover:bg-brand-primary/80 transition-all"
                                                >
                                                    Sync Logs
                                                </button>
                                            </div>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Enter mission observations here..."
                                                className="w-full h-96 bg-brand-bg/50 border border-brand-border rounded-3xl p-8 text-brand-text font-bold shadow-inner focus:border-brand-primary/50 outline-none transition-all placeholder:text-brand-muted/20 resize-none"
                                            />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'secure intel' && (
                                    <motion.div key="qa" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                        <div className="bg-brand-surface rounded-[2.5rem] p-10 border border-brand-border shadow-2xl relative overflow-hidden">
                                            <h3 className="text-2xl font-black text-brand-text mb-8 uppercase italic tracking-tighter">Encrypted Domain Discussion</h3>

                                            <div className="flex gap-6 mb-12">
                                                <input
                                                    value={newQuestion}
                                                    onChange={(e) => setNewQuestion(e.target.value)}
                                                    placeholder="Transmit new query to the sector..."
                                                    className="flex-1 bg-brand-bg/50 border border-brand-border rounded-2xl px-8 py-4 text-brand-text font-bold focus:border-brand-primary/50 outline-none transition-all placeholder:text-brand-muted/20"
                                                />
                                                <button className="px-10 bg-brand-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-premium transition-all">
                                                    Transmit
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {questions.map((q) => (
                                                    <div key={q.id} className="p-8 bg-brand-bg/30 border border-brand-border rounded-3xl hover:border-brand-primary/30 transition-all group">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl border border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-xs">
                                                                    {q.user[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-black text-brand-text uppercase tracking-tight">{q.user}</p>
                                                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{q.timestamp}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-lg">
                                                                <MessageSquare className="w-3 h-3" />
                                                                <span className="text-[10px] font-black">{q.replies} Replies</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm font-bold text-brand-muted leading-relaxed uppercase tracking-tight">
                                                            {q.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'resources' && (
                                    <motion.div key="resources" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {[
                                                { title: 'Operational Manual.pdf', size: '2.4 MB', type: 'PDF' },
                                                { title: 'Strategic Assets.zip', size: '156.0 MB', type: 'DATA' },
                                                { title: 'Sector Blueprint.png', size: '12.1 MB', type: 'IMG' }
                                            ].map((resource, i) => (
                                                <div key={i} className="bg-brand-surface p-8 rounded-[2rem] border border-brand-border shadow-premium hover:border-brand-primary/40 transition-all group cursor-pointer">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-all">
                                                            <FileText className="w-8 h-8" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-brand-text text-sm uppercase italic tracking-tighter mb-1">{resource.title}</h4>
                                                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">{resource.size} • {resource.type}</p>
                                                        </div>
                                                        <button className="p-3 bg-brand-bg border border-brand-border rounded-xl text-brand-muted hover:text-brand-primary hover:border-brand-primary/50 transition-all">
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
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

                                <div className="mb-10 text-center relative">
                                    <div className="absolute -inset-4 bg-brand-primary/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] mb-4 text-center">// Protocol Access Token</p>
                                    <h4 className="text-6xl font-black text-brand-text italic tracking-tighter text-center flex items-center justify-center gap-4">
                                        {(course.isFree || course.price === 0) ? (
                                            <span className="text-brand-primary drop-shadow-[0_0_15px_var(--color-primary)]">OPEN_ACCESS</span>
                                        ) : (
                                            <>
                                                <span className="text-zinc-500 text-2xl mt-2 italic">₹</span>
                                                <span className="text-brand-text">{course.price}</span>
                                                <span className="text-brand-primary text-xl mt-3 italic tracking-widest opacity-40">UNT</span>
                                            </>
                                        )}
                                    </h4>
                                    <div className="mt-4 flex justify-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-brand-primary/30" />
                                        <div className="w-12 h-1 bg-brand-primary/10 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="w-full h-full bg-brand-primary/40"
                                            />
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-brand-primary/30" />
                                    </div>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleEnroll}
                                    disabled={isEnrolling || isEnrolled}
                                    className={`
                                        w-full py-7 rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.4em] transition-all relative overflow-hidden group/btn
                                        ${isEnrolled
                                            ? 'bg-brand-surface border border-brand-primary/20 text-brand-primary/60 shadow-inner'
                                            : 'bg-brand-primary text-white shadow-premium hover:shadow-[0_0_40px_rgba(13,148,136,0.4)]'}
                                    `}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                                    <div className="flex items-center justify-center gap-4 relative z-10">
                                        {isEnrolling ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : isEnrolled ? (
                                            <><Shield className="w-5 h-5" /> Clearance Active</>
                                        ) : (
                                            <><Radio className="w-5 h-5 animate-pulse" /> Initiate Sync</>
                                        )}
                                    </div>
                                </motion.button>

                                {isEnrolled && (
                                    <div className="mt-6 p-6 rounded-2xl bg-brand-bg/40 border border-brand-border flex items-center justify-between">
                                        <div>
                                            <p className="text-[8px] font-black text-brand-muted uppercase tracking-widest mb-1">Grid Connectivity</p>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                                Active Uplink
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-brand-muted uppercase tracking-widest mb-1">Latency</p>
                                            <p className="text-[10px] font-black text-white uppercase italic">14ms</p>
                                        </div>
                                    </div>
                                )}

                                {isCourseCompleted && (
                                    <motion.button
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        onClick={downloadCertificate}
                                        className="w-full mt-8 py-7 bg-gradient-to-br from-brand-primary via-emerald-500 to-brand-secondary text-white rounded-[1.8rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-premium flex items-center justify-center gap-4 group/cert"
                                    >
                                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/cert:opacity-100 transition-opacity" />
                                        <Award className="w-5 h-5 group-hover:scale-125 transition-transform" />
                                        <span>Download Credentials</span>
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
