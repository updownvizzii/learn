import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Star, Clock, ChevronRight, PlayCircle, Tag, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Courses = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'DevOps', 'Cloud'];

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/courses`);
                const data = response.data;
                setCourses(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Error fetching courses:', error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course => {
        if (!course) return false;
        const title = course.title || '';
        const instructorName = course.instructor?.username || '';

        const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            instructorName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-brand-bg font-jakarta text-brand-text pb-32 selection:bg-brand-primary selection:text-white relative overflow-hidden transition-colors">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 dark:bg-blue-600/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 dark:bg-cyan-600/5 rounded-full blur-[120px]" />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-brand-surface/60 backdrop-blur-2xl border-b border-brand-border px-10 h-24 flex items-center justify-between">
                <Link to="/" className="text-brand-text font-black text-2xl italic tracking-tighter uppercase underline decoration-brand-primary decoration-4 underline-offset-8">
                    EDUFORM
                </Link>
                <div className="flex gap-8 items-center">
                    {user ? (
                        <div className="flex items-center gap-6">
                            <Link
                                to={user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'}
                                className="text-brand-muted hover:text-brand-text font-black text-[10px] uppercase tracking-widest transition-colors"
                            >
                                Command Center
                            </Link>
                            <div className="w-10 h-10 rounded-xl overflow-hidden border border-brand-border bg-brand-surface-hover hover:border-brand-primary/40 transition-all cursor-pointer">
                                <img src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-6">
                            <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-brand-text transition-colors">Log Link</button>
                            <button onClick={() => navigate('/register')} className="px-6 py-2.5 text-[10px] font-black uppercase tracking-widest bg-brand-primary text-white rounded-xl hover:bg-brand-primary/90 transition-all shadow-premium">Join Grid</button>
                        </div>
                    )}
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-10 pt-40 relative z-10">
                {/* Header & Search */}
                <div className="flex flex-col lg:flex-row justify-between items-end mb-16 gap-10">
                    <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-brand-primary/20">
                            Central Repository Alpha
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-brand-text mb-6 uppercase tracking-tighter italic">ACTIVE SECTORS</h1>
                        <p className="text-brand-muted text-lg font-medium leading-relaxed">System-wide directory of high-level tactical intelligence and operational domain mastery.</p>
                    </div>

                    <div className="flex w-full lg:w-auto gap-4">
                        <div className="relative flex-grow lg:w-96 group">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-brand-muted group-focus-within:text-brand-primary transition-colors h-4 w-4" />
                            <input
                                type="text"
                                placeholder="Scan sectors, operators..."
                                className="w-full pl-14 pr-6 py-4.5 rounded-[1.5rem] border border-brand-border bg-brand-surface text-brand-text focus:outline-none focus:border-brand-primary/50 shadow-premium dark:shadow-premium-dark transition-all font-bold text-sm placeholder:text-brand-muted/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center justify-center w-14 h-14 bg-brand-surface rounded-2xl border border-brand-border hover:border-brand-primary/30 transition-all group">
                            <Filter className="h-5 w-5 text-brand-muted group-hover:text-brand-text transition-colors" />
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto pb-8 mb-8 gap-4 no-scrollbar border-b border-brand-border transition-colors">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-8 py-3 rounded-2xl whitespace-nowrap text-[10px] font-black uppercase tracking-widest transition-all duration-300 border ${selectedCategory === cat
                                ? 'bg-brand-primary text-white border-brand-primary/50 shadow-premium dark:shadow-premium-dark scale-105'
                                : 'bg-brand-surface text-brand-muted border-brand-border hover:text-brand-text hover:border-brand-primary/30'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-48">
                        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-8"></div>
                        <p className="text-brand-muted font-bold uppercase tracking-[0.3em] text-[10px] transition-colors">Syncing Tactical Grid...</p>
                    </div>
                ) : (
                    <>
                        <motion.div
                            layout
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredCourses.map((course) => (
                                    <motion.div
                                        key={course._id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => navigate(`/courses/${course._id}`)}
                                        className="bg-brand-surface rounded-[2.5rem] overflow-hidden border border-brand-border hover:border-brand-primary/40 transition-all group cursor-pointer flex flex-col h-full shadow-premium dark:shadow-premium-dark relative z-10 glimmer"
                                    >
                                        <div className="relative h-56 overflow-hidden">
                                            <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-[4px]">
                                                <div className="bg-white/10 backdrop-blur-xl border border-white/20 text-white p-5 rounded-full transform scale-50 group-hover:scale-100 transition-all duration-500">
                                                    <PlayCircle className="w-10 h-10" />
                                                </div>
                                            </div>
                                            <img
                                                src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${API_URL.replace('/api', '')}${course.thumbnail}`) : 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'; }}
                                            />
                                            <div className="absolute top-5 left-5 z-20">
                                                <span className="px-3 py-1 bg-brand-surface/80 backdrop-blur-md rounded-lg text-[9px] font-black uppercase tracking-widest text-brand-primary border border-brand-primary/30">
                                                    {course.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-8 flex flex-col flex-1 relative z-10">
                                            <h3 className="text-xl font-black text-brand-text mb-3 line-clamp-2 italic uppercase tracking-tight group-hover:text-brand-primary transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest mb-6 opacity-60">MASTER: {course.instructor?.username || 'Redacted'}</p>

                                            <div className="flex items-center gap-6 mb-8 text-[9px] font-black uppercase tracking-widest text-brand-muted">
                                                <div className="flex items-center text-brand-primary">
                                                    <Star className="h-3.5 w-3.5 fill-current mr-1.5" />
                                                    <span className="text-brand-text">{course.rating || '5.0'}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-3.5 w-3.5 mr-1.5" />
                                                    {course.duration || '24h'}
                                                </div>
                                                <div className="flex items-center">
                                                    <Tag className="h-3.5 w-3.5 mr-1.5" />
                                                    {course.level || 'Elite'}
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-brand-border transition-colors">
                                                <span className="text-2xl font-black text-brand-text italic transition-colors">
                                                    {course.isFree ? (
                                                        <span className="text-brand-primary">OPEN</span>
                                                    ) : (
                                                        `${course.price} UNT`
                                                    )}
                                                </span>
                                                <span className="text-brand-primary font-black text-[10px] uppercase tracking-widest flex items-center group-hover:gap-2 transition-all">
                                                    SYNC <ChevronRight className="w-4 h-4" />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filteredCourses.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-48">
                                <div className="bg-brand-surface rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8 border border-brand-border shadow-premium transition-all">
                                    <Search className="h-10 w-10 text-brand-muted" />
                                </div>
                                <h3 className="text-2xl font-black text-brand-text uppercase italic tracking-tight transition-colors">SECTOR EMPTY</h3>
                                <p className="text-brand-muted font-bold uppercase tracking-widest text-xs mt-4 transition-colors">Unauthorized or unavailable coordinates.</p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Courses;
