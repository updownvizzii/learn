import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Star, Clock, ChevronRight, PlayCircle, Tag, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Courses = () => {
    const navigate = useNavigate();
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 pb-20 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
            </div>

            {/* Navbar Placeholder */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                <Link to="/student/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    Back to Dashboard
                </Link>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">S</div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 relative z-10">

                {/* Header & Search */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Explore Courses</h1>
                        <p className="text-gray-600 text-lg">Master new skills with our top-rated courses.</p>
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <div className="relative flex-grow md:w-96 group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors h-5 w-5" />
                            <input
                                type="text"
                                placeholder="Search courses, instructors..."
                                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white/50 backdrop-blur focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="flex items-center px-4 py-3.5 bg-white rounded-2xl border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all">
                            <Filter className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto pb-6 mb-4 gap-3 no-scrollbar">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-sm font-bold transition-all duration-300 ${selectedCategory === cat
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-indigo-200'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Fetching courses from our library...</p>
                    </div>
                ) : (
                    <>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        >
                            <AnimatePresence>
                                {filteredCourses.map((course) => (
                                    <motion.div
                                        layout
                                        variants={itemVariants}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={course._id}
                                        onClick={() => navigate(`/courses/${course._id}`)}
                                        className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group cursor-pointer border border-gray-100 flex flex-col h-full"
                                    >
                                        <div className="relative h-48 overflow-hidden">
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-[2px]">
                                                <button className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                    <PlayCircle className="w-8 h-8" />
                                                </button>
                                            </div>
                                            <img
                                                src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `${API_URL.replace('/api', '')}${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'}
                                                alt={course.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'; }}
                                            />
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className="px-3 py-1 bg-white/90 backdrop-blur rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
                                                    {course.category}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="p-6 flex flex-col flex-1">
                                            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                                {course.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 mb-4">{course.instructor?.username || 'Unknown Instructor'}</p>

                                            <div className="flex items-center gap-4 mb-4 text-xs font-medium text-gray-500">
                                                <div className="flex items-center text-yellow-500">
                                                    <Star className="h-3.5 w-3.5 fill-current mr-1" />
                                                    <span className="text-gray-900 font-bold">{course.rating || 0}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                                    {course.duration || 'N/A'}
                                                </div>
                                                <div className="flex items-center">
                                                    <Tag className="h-3.5 w-3.5 mr-1" />
                                                    {course.level || 'All Levels'}
                                                </div>
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                                <span className="text-xl font-extrabold text-gray-900">
                                                    {course.isFree ? (
                                                        <span className="text-emerald-600">Free</span>
                                                    ) : (
                                                        `${course.currency || 'INR'} ${course.price}`
                                                    )}
                                                </span>
                                                <span className="text-indigo-600 font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform">
                                                    Enroll <ChevronRight className="w-4 h-4 ml-1" />
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filteredCourses.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-32">
                                <div className="bg-indigo-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-10 w-10 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">No courses found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your search or category filter.</p>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Courses;
