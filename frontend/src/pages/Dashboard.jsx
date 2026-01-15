import React, { useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen,
    Clock,
    Award,
    TrendingUp,
    PlayCircle,
    PieChart,
    Layout,
    Settings,
    LogOut,
    Bell,
    Search,
    ChevronRight,
    MoreVertical,
    Grid,
    List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Legend,
    RadialBarChart,
    RadialBar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchEnrolledCourses = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await fetch('http://localhost:5000/api/courses/enrolled', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }

                const data = await response.json();
                if (Array.isArray(data)) {
                    setEnrolledCourses(data);
                }
            } catch (error) {
                console.error('Error fetching enrolled courses:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrolledCourses();
    }, []);

    const handleCourseClick = (id) => {
        navigate(`/courses/${id}`);
    };

    const stats = [
        { label: 'Enrolled Courses', value: enrolledCourses.length.toString(), icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Hours Learned', value: '0', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-100' },
        { label: 'Certificates', value: '0', icon: Award, color: 'text-amber-600', bg: 'bg-amber-100' },
        { label: 'Avg. Score', value: '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    ];


    const displayedCourses = useMemo(() => {
        if (!searchQuery) return activeTab === 'overview' ? enrolledCourses.slice(0, 3) : enrolledCourses;
        return enrolledCourses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.instructor && course.instructor.username && course.instructor.username.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, activeTab, enrolledCourses]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                duration: 0.5
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans text-gray-900 flex overflow-hidden relative">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <aside className="w-20 lg:w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col fixed h-full z-40 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div className="h-24 flex items-center justify-center lg:justify-start lg:px-8 border-b border-gray-100/50">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                        E
                    </div>
                    <span className="hidden lg:block ml-3 font-bold text-xl text-gray-800 tracking-tight">EduPlatform</span>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
                        className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 group ${activeTab === 'overview'
                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <Layout className={`w-5 h-5 ${activeTab === 'overview' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        <span className="hidden lg:block ml-3 font-medium text-sm">Dashboard</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('my-courses'); setSearchQuery(''); }}
                        className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 group ${activeTab === 'my-courses'
                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <BookOpen className={`w-5 h-5 ${activeTab === 'my-courses' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        <span className="hidden lg:block ml-3 font-medium text-sm">My Courses</span>
                    </button>

                    <button
                        onClick={() => navigate('/courses')}
                        className="w-full flex items-center p-3 rounded-2xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-300 group"
                    >
                        <Search className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                        <span className="hidden lg:block ml-3 font-medium text-sm">Browse Courses</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('stats'); setSearchQuery(''); }}
                        className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 group ${activeTab === 'stats'
                            ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                    >
                        <PieChart className={`w-5 h-5 ${activeTab === 'stats' ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                        <span className="hidden lg:block ml-3 font-medium text-sm">Analytics & Stats</span>
                    </button>

                </nav>

                <div className="p-4 border-t border-gray-100/50">
                    <button
                        onClick={logout}
                        className="w-full flex items-center p-3 rounded-2xl text-red-500 hover:bg-red-50 transition-colors group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden lg:block ml-3 font-medium text-sm">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-20 lg:ml-72 flex flex-col min-h-screen relative z-10">
                {/* Topbar */}
                <header className="h-24 bg-white/50 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-200/50 px-8 flex items-center justify-between transition-all duration-300">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeTab === 'overview' && 'Dashboard'}
                            {activeTab === 'my-courses' && 'My Courses'}
                            {activeTab === 'stats' && 'Analytics'}
                        </h2>
                        <p className="text-xs text-gray-500">Welcome back, {user?.username}!</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {activeTab === 'my-courses' && (
                            <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2.5 w-64 lg:w-80 shadow-sm focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300 transition-all">
                                <Search className="w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search your courses..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-sm ml-3 w-full text-gray-700 placeholder-gray-400"
                                />
                            </div>
                        )}

                        <button className="relative p-2.5 bg-white rounded-xl border border-gray-100 text-gray-400 hover:text-gray-600 hover:shadow-md transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center gap-3 pl-6 border-l border-gray-200/50">
                            <img
                                src={user?.profilePicture || "https://api.dicebear.com/7.x/notionists/svg?seed=Felix"}
                                alt="Profile"
                                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                            />
                        </div>
                    </div>
                </header>

                <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {stats.map((stat, index) => (
                                        <motion.div
                                            key={index}
                                            variants={itemVariants}
                                            className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-white hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                                    <h3 className="text-3xl font-extrabold text-gray-900 mt-2 tracking-tight group-hover:text-indigo-600 transition-colors">{stat.value}</h3>
                                                </div>
                                                <div className={`p-3.5 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 rotate-0 group-hover:rotate-6 transition-all duration-300`}>
                                                    <stat.icon className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Continue Learning & Banner */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left: Courses */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-gray-900">Continue Learning</h3>
                                            <button
                                                onClick={() => setActiveTab('my-courses')}
                                                className="text-indigo-600 text-sm font-semibold hover:text-indigo-800 flex items-center gap-1 group"
                                            >
                                                View All <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {displayedCourses.map((course) => (
                                                <motion.div
                                                    key={course.id}
                                                    variants={itemVariants}
                                                    onClick={() => handleCourseClick(course.id)}
                                                    className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-4 group cursor-pointer"
                                                >
                                                    <div className="w-24 h-24 rounded-xl overflow-hidden relative flex-shrink-0">
                                                        <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                            <PlayCircle className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="text-[10px] font-bold tracking-wider text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">{course.category}</span>
                                                        </div>
                                                        <h4 className="font-bold text-gray-900 truncate mb-1">{course.title}</h4>
                                                        <p className="text-sm text-gray-500 mb-3">{course.instructor?.username || 'Unknown Instructor'}</p>

                                                        <div className="flex items-center gap-3">
                                                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-indigo-600 rounded-full"
                                                                    style={{ width: `${course.progress}%` }}
                                                                ></div>
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700 w-8">{course.progress}%</span>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right: Daily Goal / Promo */}
                                    <div className="space-y-6">
                                        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200 relative overflow-hidden">
                                            <div className="relative z-10">
                                                <h3 className="text-2xl font-bold mb-2">Daily Goal</h3>
                                                <p className="text-indigo-100 text-sm mb-6">Learn 45 minutes today to keep your streak!</p>

                                                <div className="flex items-baseline gap-1 mb-4">
                                                    <span className="text-4xl font-bold">32</span>
                                                    <span className="text-lg opacity-80">/ 45 min</span>
                                                </div>

                                                <button className="w-full bg-white/20 backdrop-blur-md border border-white/30 text-white px-4 py-3 rounded-xl font-semibold hover:bg-white hover:text-indigo-600 transition-all">
                                                    Resume Learning
                                                </button>
                                            </div>
                                            {/* Decorative Circles */}
                                            <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                                            <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-purple-500/30 rounded-full blur-xl" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'my-courses' && (
                            <motion.div
                                key="my-courses"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {displayedCourses.map((course) => (
                                        <motion.div
                                            key={course.id}
                                            variants={itemVariants}
                                            whileHover={{ y: -8 }}
                                            onClick={() => handleCourseClick(course.id)}
                                            className="bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
                                        >
                                            <div className="h-40 rounded-2xl overflow-hidden relative mb-4">
                                                <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm">
                                                    {course.category}
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button className="bg-white/20 backdrop-blur text-white p-3 rounded-full hover:bg-white hover:text-indigo-600 transition-all transform scale-0 group-hover:scale-100 duration-300">
                                                        <PlayCircle className="w-8 h-8" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="px-2 pb-2">
                                                <h3 className="font-bold text-gray-900 mb-1 truncate text-lg">{course.title}</h3>
                                                <p className="text-sm text-gray-500 mb-4">{course.instructor?.username || 'Unknown Instructor'}</p>

                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">{course.progress}% Completed</span>
                                                </div>
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                {displayedCourses.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <Search className="w-16 h-16 mb-4 opacity-20" />
                                        <p className="text-lg">No courses found matching "{searchQuery}"</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'stats' && (
                            <motion.div
                                key="stats"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Activity Chart */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <Clock className="w-5 h-5 text-indigo-500" /> Weekly Activity
                                        </h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart data={activityData}>
                                                    <defs>
                                                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                    <Area type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorHours)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Skills Radar */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-emerald-500" /> Skills Breakdown
                                        </h3>
                                        <div className="h-80 flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                                                    <PolarGrid stroke="#e5e7eb" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                                                    <Radar name="Mike" dataKey="A" stroke="#8b5cf6" strokeWidth={2} fill="#8b5cf6" fillOpacity={0.5} />
                                                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Progress Radial */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <PieChart className="w-5 h-5 text-purple-500" /> Course Status
                                        </h3>
                                        <div className="h-80 flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadialBarChart innerRadius="20%" outerRadius="100%" barSize={20} data={progressData}>
                                                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={10} />
                                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, top: '50%', transform: 'translate(0, -50%)', lineHeight: '24px' }} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                                </RadialBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Grades Bar Chart */}
                                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <Award className="w-5 h-5 text-amber-500" /> Performance
                                        </h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={skillsData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                                    <Bar dataKey="A" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
