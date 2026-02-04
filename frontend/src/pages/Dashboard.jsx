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
    List,
    Trophy,
    Zap
} from 'lucide-react';
import { LeaderboardCard } from '../components/GamificationUI';
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
import InactivityAlert from '../components/InactivityAlert';
import WelcomeBanner from '../components/WelcomeBanner';
import QuickActions from '../components/QuickActions';
import LearningPath from '../components/LearningPath';
import ThemeToggle from '../components/ThemeToggle';
import { XPBar, StreakCounter } from '../components/GamificationUI';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [enrolledCourses, setEnrolledCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { label: 'Active Sectors', value: '0', icon: BookOpen },
        { label: 'Sync Time', value: '0', icon: Clock },
        { label: 'Clearance Cards', value: '0', icon: Award },
        { label: 'Sync Progress', value: '0%', icon: TrendingUp },
    ]);

    const [profile, setProfile] = useState({
        username: '',
        email: '',
        bio: '',
        profilePicture: ''
    });

    const { updateUser } = useAuth();

    const [fullStats, setFullStats] = useState(null);
    const [gamificationStats, setGamificationStats] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [leaderboardLoading, setLeaderboardLoading] = useState(false);

    React.useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const baseUrl = 'http://localhost:5000/api';

                // Fetch Enrolled Courses
                const coursesResponse = await fetch(`${baseUrl}/courses/enrolled`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (coursesResponse.status === 401) {
                    logout();
                    navigate('/login');
                    return;
                }

                const coursesData = await coursesResponse.json();
                if (Array.isArray(coursesData)) {
                    setEnrolledCourses(coursesData);
                }

                // Fetch Stats
                const statsResponse = await fetch(`${baseUrl}/courses/student-stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const statsData = await statsResponse.json();

                if (statsData) {
                    setFullStats(statsData);
                    setStats([
                        { label: 'Enrolled Sectors', value: statsData.enrolledCourses?.toString() || '0', icon: BookOpen },
                        { label: 'Operations Uptime', value: `${statsData.hoursLearned || 0}h`, icon: Clock },
                        { label: 'Elite Streak', value: `${statsData.streak || 0} Days`, icon: Zap },
                        { label: 'Sector Mastery', value: `${statsData.avgProgress || 0}%`, icon: TrendingUp },
                    ]);
                }

                // Fetch Gamification Stats
                const gamificationResponse = await fetch(`${baseUrl}/gamification/stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const gData = await gamificationResponse.json();
                if (gData && !gData.message) {
                    setGamificationStats(gData);
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        if (user) {
            setProfile({
                username: user.username || '',
                email: user.email || '',
                bio: user.bio || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
            const data = await response.json();
            if (response.ok) {
                updateUser(data);
                alert('PROFILE SYNCED: Tactical records updated.');
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('System Error: Profile uplink failure.');
        }
    };


    const handleCourseClick = (id) => {
        navigate(`/courses/${id}`);
    };

    const handleQuickAction = (actionId) => {
        switch (actionId) {
            case 'continue-learning':
                if (enrolledCourses.length > 0) {
                    navigate(`/courses/${enrolledCourses[0]._id}`);
                } else {
                    navigate('/courses');
                }
                break;
            case 'browse-courses':
                navigate('/courses');
                break;
            case 'view-certificates':
                setActiveTab('my-courses');
                break;
            case 'set-goals':
                setActiveTab('stats');
                break;
            case 'leaderboard':
                setActiveTab('leaderboard');
                break;
            default:
                break;
        }
    };

    const fetchLeaderboard = async () => {
        setLeaderboardLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const res = await fetch(`http://localhost:5000/api/gamification/leaderboard`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setLeaderboardData(data);
            }
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLeaderboardLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeTab === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [activeTab]);

    const displayedCourses = useMemo(() => {
        if (!searchQuery) return activeTab === 'overview' ? enrolledCourses.slice(0, 3) : enrolledCourses;
        return enrolledCourses.filter(course =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.instructor && course.instructor.username && course.instructor.username.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [searchQuery, activeTab, enrolledCourses]);

    // Data for Charts with robust fallbacks for visibility
    const activityData = useMemo(() => fullStats?.activityData && fullStats.activityData.length > 0 ? fullStats.activityData : [
        { name: 'Mon', hours: 2 }, { name: 'Tue', hours: 4 }, { name: 'Wed', hours: 3 },
        { name: 'Thu', hours: 5 }, { name: 'Fri', hours: 2 }, { name: 'Sat', hours: 1 }, { name: 'Sun', hours: 0 }
    ], [fullStats]);

    const skillsData = useMemo(() => fullStats?.skillsData && fullStats.skillsData.length > 0 ? fullStats.skillsData : [
        { subject: 'React', A: 120, fullMark: 150 }, { subject: 'Node.js', A: 98, fullMark: 150 },
        { subject: 'Design', A: 86, fullMark: 150 }, { subject: 'DevOps', A: 99, fullMark: 150 },
        { subject: 'Testing', A: 85, fullMark: 150 }, { subject: 'Database', A: 65, fullMark: 150 }
    ], [fullStats]);

    const progressData = useMemo(() => {
        const rawData = fullStats?.progressDistribution;
        // Check if all values are 0 (new user)
        const total = rawData?.reduce((acc, curr) => acc + curr.value, 0) || 0;
        if (total === 0) return [
            { name: 'Completed', value: 1, fill: '#10b981' },
            { name: 'In Progress', value: 1, fill: '#6366f1' },
            { name: 'Not Started', value: 4, fill: '#f59e0b' }
        ];
        return rawData;
    }, [fullStats]);

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
        <div className="min-h-screen bg-brand-bg font-jakarta text-brand-text flex overflow-hidden relative transition-colors">
            {/* Inactivity Alert */}
            <InactivityAlert lastActive={user?.lastActive} />

            {/* Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/10 dark:bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300/10 dark:bg-cyan-600/5 rounded-full blur-[100px]" />
            </div>

            {/* Sidebar */}
            <aside className="w-64 bg-brand-surface border-r border-brand-border flex flex-col fixed h-full z-40 transition-all duration-300">
                <div className="p-8 pb-4 flex items-center">
                    <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-premium">
                        F
                    </div>
                    <span className="ml-3 font-bold text-xl text-brand-text tracking-tight transition-colors">EDUFORM</span>
                </div>

                <nav className="flex-1 py-10 px-4 space-y-2">
                    <button
                        onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
                        className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'overview'
                            ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                            : 'text-brand-muted hover:bg-brand-primary/5 hover:text-brand-text'
                            }`}
                    >
                        <Layout className={`w-5 h-5 ${activeTab === 'overview' ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-text transition-colors'}`} />
                        <span className="ml-3 font-semibold text-sm">Dashboard</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('my-courses'); setSearchQuery(''); }}
                        className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'my-courses'
                            ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                            : 'text-brand-muted hover:bg-brand-primary/5 hover:text-brand-text'
                            }`}
                    >
                        <BookOpen className={`w-5 h-5 ${activeTab === 'my-courses' ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-text transition-colors'}`} />
                        <span className="ml-3 font-semibold text-sm">My Learning</span>
                    </button>

                    <button
                        onClick={() => navigate('/courses')}
                        className="w-full flex items-center p-3.5 rounded-2xl text-brand-muted hover:bg-brand-primary/5 hover:text-brand-text transition-all duration-300 group"
                    >
                        <Search className="w-5 h-5 text-brand-muted group-hover:text-brand-text transition-colors" />
                        <span className="ml-3 font-semibold text-sm">Explore All</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('stats'); setSearchQuery(''); }}
                        className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'stats'
                            ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                            : 'text-brand-muted hover:bg-brand-primary/5 hover:text-brand-text'
                            }`}
                    >
                        <PieChart className={`w-5 h-5 ${activeTab === 'stats' ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-text transition-colors'}`} />
                        <span className="ml-3 font-semibold text-sm">Analytics</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('leaderboard')}
                        className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'leaderboard' ? 'bg-brand-primary/10 text-brand-primary shadow-sm' : 'text-brand-muted hover:bg-brand-primary/5 hover:text-brand-text'}`}
                    >
                        <Trophy className={`w-5 h-5 ${activeTab === 'leaderboard' ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-text transition-colors'}`} />
                        <span className="ml-3 font-semibold text-sm">Leaderboard</span>
                    </button>

                    <button
                        onClick={() => { setActiveTab('settings'); setSearchQuery(''); }}
                        className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group ${activeTab === 'settings'
                            ? 'bg-brand-primary/10 text-brand-primary shadow-sm'
                            : 'text-brand-muted hover:bg-brand-primary/5 hover:text-brand-text'
                            }`}
                    >
                        <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'text-brand-primary' : 'text-brand-muted group-hover:text-brand-text transition-colors'}`} />
                        <span className="ml-3 font-semibold text-sm">Tactical Setup</span>
                    </button>

                </nav>

                <div className="p-4 border-t border-brand-border">
                    <button
                        onClick={logout}
                        className="w-full flex items-center p-3.5 rounded-2xl text-red-500/80 hover:bg-red-500/5 hover:text-red-500 transition-all group"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="ml-3 font-semibold text-sm">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64 flex flex-col min-h-screen relative z-10">
                {/* Topbar */}
                <header className="h-24 bg-brand-surface/80 backdrop-blur-2xl sticky top-0 z-30 border-b border-brand-border px-10 flex items-center justify-between shadow-premium dark:shadow-none transition-all">
                    <div className="flex flex-col justify-center">
                        <h2 className="text-2xl font-black text-brand-text tracking-tight transition-colors uppercase italic">
                            {activeTab === 'overview' && 'SYSTEM STATUS'}
                            {activeTab === 'my-courses' && 'MY COURSES'}
                            {activeTab === 'stats' && 'STRATEGIC ANALYTICS'}
                            {activeTab === 'settings' && 'PROTOCOL SETUP'}
                        </h2>
                        <p className="text-xs text-brand-muted font-black uppercase tracking-[0.1em] transition-colors">Operator: {user?.username}</p>
                    </div>

                    <div className="flex items-center gap-6">
                        {activeTab === 'my-courses' && (
                            <div className="hidden md:flex items-center bg-brand-bg border border-brand-border rounded-2xl px-5 py-2.5 w-64 shadow-premium focus-within:border-brand-primary/50 transition-all">
                                <Search className="w-4 h-4 text-brand-muted" />
                                <input
                                    type="text"
                                    placeholder="Search command..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none text-sm ml-3 w-full text-brand-text placeholder:text-brand-muted/20 font-bold"
                                />
                            </div>
                        )}

                        <button className="relative p-2.5 bg-brand-bg rounded-xl border border-brand-border text-brand-muted hover:text-brand-text hover:border-brand-primary/30 transition-all shadow-premium">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full animate-pulse shadow-[0_0_10px_var(--color-primary)]"></span>
                        </button>

                        {/* Theme Toggle */}
                        <ThemeToggle />

                        <div className="flex items-center gap-3 pl-6 border-l border-brand-border">
                            <div className="w-10 h-10 rounded-full border border-brand-border p-1 shadow-premium">
                                <img
                                    src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Felix'}`}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover cursor-pointer hover:scale-110 transition-transform shadow-lg"
                                    onClick={() => setActiveTab('settings')}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full flex-1 overflow-y-auto custom-scrollbar">
                    <AnimatePresence mode='wait'>
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-10"
                            >
                                {/* Welcome Banner Component */}
                                <WelcomeBanner userName={user?.username} />

                                {/* Gamification Stats */}
                                {gamificationStats && (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        <div className="lg:col-span-2">
                                            <XPBar
                                                currentXP={gamificationStats.xp}
                                                requiredXP={gamificationStats.requiredXP}
                                                level={gamificationStats.level}
                                            />
                                        </div>
                                        <div>
                                            <StreakCounter
                                                streak={gamificationStats.streak}
                                                bestStreak={gamificationStats.bestStreak}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {stats.map((stat, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="bg-brand-surface border border-brand-border p-6 rounded-[2rem] hover:border-brand-primary/50 transition-all group shadow-premium dark:shadow-premium-dark relative overflow-hidden glimmer"
                                        >
                                            <div className="flex items-center justify-between relative z-10">
                                                <div className={`p-4 rounded-2xl bg-brand-primary/10 text-brand-primary`}>
                                                    <stat.icon className="w-6 h-6" />
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-bold text-brand-muted uppercase tracking-widest">{stat.label}</p>
                                                    <h4 className="text-3xl font-black text-brand-text mt-1">{stat.value}</h4>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <QuickActions onAction={handleQuickAction} />

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left: Recent Activity */}
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xl font-black text-brand-text tracking-tight uppercase italic transition-colors">ACTIVE OPERATIONS</h3>
                                            <button
                                                onClick={() => setActiveTab('my-courses')}
                                                className="text-xs font-black text-brand-primary flex items-center hover:underline uppercase tracking-widest transition-all"
                                            >
                                                Full Archive <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {enrolledCourses.length > 0 ? (
                                                enrolledCourses.slice(0, 3).map((course, idx) => (
                                                    <div
                                                        key={course._id}
                                                        onClick={() => handleCourseClick(course._id)}
                                                        className="bg-brand-surface border border-brand-border p-5 rounded-3xl hover:border-brand-primary/30 transition-all group cursor-pointer flex items-center gap-6 shadow-premium dark:shadow-premium-dark"
                                                    >
                                                        <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border border-brand-border">
                                                            <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1 block">{course.category}</span>
                                                                    <h4 className="font-bold text-brand-text group-hover:text-brand-primary transition-colors uppercase leading-tight italic">{course.title}</h4>
                                                                </div>
                                                                <span className="text-xs font-black text-brand-muted">{course.progress || 0}%</span>
                                                            </div>
                                                            <div className="h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${course.progress || 0}%` }}
                                                                    className="h-full bg-brand-primary shadow-[0_0_10px_var(--color-primary)]"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-12 text-center text-brand-muted bg-brand-surface rounded-[2.5rem] border border-brand-border shadow-premium transition-all font-black uppercase tracking-widest italic">
                                                    No active operations found. Initiate first course.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right: Daily Goal / Promo */}
                                    <div className="space-y-6">
                                        <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 border-2 border-brand-primary/20">
                                            <div className="relative z-10">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h3 className="text-xl font-black tracking-tight uppercase italic text-brand-text transition-colors">Target Status</h3>
                                                    <div className="px-3 py-1 bg-brand-primary/10 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-brand-primary">
                                                        Day {fullStats?.currentDay || 1}
                                                    </div>
                                                </div>

                                                {/* Progress Circle */}
                                                <div className="flex items-center justify-center mb-8">
                                                    <div className="relative w-36 h-36">
                                                        <svg className="w-full h-full transform -rotate-90">
                                                            <circle cx="72" cy="72" r="62" stroke="var(--color-border)" strokeWidth="10" fill="none" />
                                                            <circle
                                                                cx="72" cy="72" r="62"
                                                                stroke="var(--color-primary)"
                                                                strokeWidth="10"
                                                                fill="none"
                                                                strokeDasharray={`${((fullStats?.dailyGoalProgress || 0) / 100) * 2 * Math.PI * 62} ${2 * Math.PI * 62}`}
                                                                strokeLinecap="round"
                                                                className="transition-all duration-1000 shadow-[0_0_20px_var(--color-primary)] opacity-80"
                                                            />
                                                        </svg>
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <span className="text-4xl font-black text-brand-text transition-colors">{fullStats?.dailyMinutes || 0}</span>
                                                            <span className="text-[10px] uppercase font-black tracking-widest text-brand-primary">Minutes</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center gap-2 mb-6 text-sm font-black uppercase tracking-widest text-brand-muted transition-colors">
                                                    <span>🔥 {fullStats?.streak || 0} Day Streak</span>
                                                </div>

                                                <button
                                                    onClick={() => handleQuickAction('continue-learning')}
                                                    className="w-full bg-brand-primary text-white px-4 py-4 rounded-2xl font-black uppercase tracking-wider hover:bg-brand-primary/90 transition-all shadow-premium"
                                                >
                                                    Execute Learning
                                                </button>
                                            </div>
                                            <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-brand-primary/10 rounded-full blur-[80px]" />
                                        </div>

                                        {/* Achievement Badge */}
                                        <div className="bg-brand-surface p-6 rounded-[2rem] border border-brand-border shadow-premium relative overflow-hidden group transition-all">
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-3xl border border-brand-primary/20 shadow-xl group-hover:scale-110 transition-transform">
                                                    {fullStats?.certificatesEarned > 0 ? '🎖️' : '🚀'}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-black text-brand-text text-sm uppercase tracking-tight transition-colors">{fullStats?.certificatesEarned > 0 ? 'RANK: MASTER' : 'RANK: INITIATE'}</h4>
                                                    <p className="text-xs text-brand-muted font-black transition-colors">
                                                        {fullStats?.certificatesEarned > 0
                                                            ? `Access granted to ${fullStats.certificatesEarned} credentials.`
                                                            : 'Dominate first course to rank up.'}
                                                    </p>
                                                    <div className="mt-3 h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                                                        <div className="h-full bg-brand-primary shadow-[0_0_10px_var(--color-primary)]" style={{ width: `${Math.min(100, (fullStats?.avgProgress || 0))}%` }}></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Learning Path */}
                                <div className="mt-8">
                                    <LearningPath courses={enrolledCourses} fullStats={fullStats} />
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
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {displayedCourses.map((course) => (
                                        <motion.div
                                            key={course._id}
                                            variants={itemVariants}
                                            whileHover={{ y: -10 }}
                                            onClick={() => handleCourseClick(course._id)}
                                            className="bg-brand-surface p-10 rounded-[3rem] shadow-premium border border-brand-border hover:border-brand-primary/40 transition-all group glimmer relative overflow-hidden"
                                        >
                                            <div className="h-48 rounded-2xl overflow-hidden relative mb-5 border border-brand-border shadow-md">
                                                <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute top-3 right-3 bg-brand-surface/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-black text-brand-primary shadow-xl border border-brand-border uppercase tracking-widest">
                                                    {course.category}
                                                </div>
                                                <div className="absolute inset-0 bg-brand-primary/20 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-[2px]">
                                                    <button className="bg-brand-primary text-white p-4 rounded-full shadow-premium transform scale-0 group-hover:scale-100 duration-300">
                                                        <PlayCircle className="w-8 h-8" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="px-3 pb-3">
                                                <h3 className="font-black text-brand-text mb-2 truncate text-lg uppercase tracking-tight group-hover:text-brand-primary transition-colors italic">{course.title}</h3>
                                                <p className="text-xs font-bold text-brand-muted mb-6 uppercase tracking-widest transition-colors">{course.instructor?.username || 'Unknown Operator'}</p>

                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{course.progress}% SYNCED</span>
                                                </div>
                                                <div className="h-2 bg-brand-bg rounded-full overflow-hidden border border-brand-border">
                                                    <div className="h-full bg-brand-primary shadow-[0_0_10px_var(--color-primary)] transition-all duration-1000" style={{ width: `${course.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                                {displayedCourses.length === 0 && (
                                    <div className="flex flex-col items-center justify-center py-32 text-brand-muted">
                                        <Search className="w-20 h-20 mb-6 opacity-20" />
                                        <p className="text-xl font-black uppercase tracking-widest italic">Record Archive Empty</p>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'settings' && (
                            <motion.div
                                key="settings"
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-4xl mx-auto space-y-8"
                            >
                                <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium glimmer transition-all">
                                    <h3 className="text-xl font-black text-brand-text mb-8 flex items-center gap-3 uppercase tracking-tight italic transition-colors">
                                        <Settings className="w-6 h-6 text-brand-primary" /> Operator Profile
                                    </h3>
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-10">
                                            <div className="relative group">
                                                <img
                                                    src={profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'default'}`}
                                                    alt="Profile"
                                                    className="w-32 h-32 rounded-3xl border-4 border-brand-border p-1 object-cover shadow-premium group-hover:border-brand-primary/50 transition-all"
                                                />
                                                <div className="absolute inset-0 bg-brand-primary/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 transition-colors">Biometric Image Link</label>
                                                    <input
                                                        type="text"
                                                        value={profile.profilePicture || ''}
                                                        onChange={(e) => setProfile(prev => ({ ...prev, profilePicture: e.target.value }))}
                                                        placeholder="https://image-uplink.com/avatar.jpg"
                                                        className="w-full px-6 py-4 bg-brand-bg border border-brand-border rounded-2xl focus:border-brand-primary/50 outline-none transition-all text-sm font-bold text-brand-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-1 transition-colors">Operator Handle</label>
                                                <input
                                                    type="text"
                                                    value={profile.username}
                                                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                                                    className="w-full px-6 py-4 rounded-2xl border border-brand-border bg-brand-bg focus:border-brand-primary/50 outline-none text-brand-text font-bold transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-1 transition-colors">Secure Email</label>
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    readOnly
                                                    className="w-full px-6 py-4 rounded-2xl border border-brand-border bg-brand-bg/50 text-brand-muted font-bold outline-none cursor-not-allowed"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-1 transition-colors">Bio-Signature</label>
                                            <textarea
                                                rows="4"
                                                value={profile.bio || ''}
                                                onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                                                className="w-full px-6 py-4 rounded-2xl border border-brand-border bg-brand-bg focus:border-brand-primary/50 outline-none text-brand-text font-bold transition-all"
                                                placeholder="Enter mission objectives..."
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-6">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="px-10 py-4 bg-brand-surface border border-brand-border text-brand-muted rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:text-brand-text transition-all shadow-premium"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        onClick={handleProfileUpdate}
                                        className="px-10 py-4 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary/90 transition-all shadow-premium"
                                    >
                                        Synchronize Profile
                                    </button>
                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'stats' && (
                            <motion.div
                                key="stats"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-10"
                            >
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    {/* Activity Chart */}
                                    <div className="bg-brand-surface p-8 rounded-[2.5rem] shadow-premium border border-brand-border glimmer transition-all">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-lg font-black text-brand-text uppercase tracking-widest italic transition-colors">Learning Consistency</h3>
                                                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">// Operational uptime per 24h cycle</p>
                                            </div>
                                            <Clock className="w-5 h-5 text-brand-primary opacity-50" />
                                        </div>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <AreaChart data={activityData}>
                                                    <defs>
                                                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-premium)', color: 'var(--color-text)' }} />
                                                    <Area type="monotone" dataKey="hours" stroke="var(--color-primary)" strokeWidth={5} fillOpacity={1} fill="url(#colorHours)" />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Skills Radar */}
                                    <div className="bg-brand-surface p-8 rounded-[2.5rem] shadow-premium border border-brand-border glimmer transition-all">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-lg font-black text-brand-text uppercase tracking-widest italic transition-colors">Proficiency Matrix</h3>
                                                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">// Strategic skill domination levels</p>
                                            </div>
                                            <TrendingUp className="w-5 h-5 text-brand-primary opacity-50" />
                                        </div>
                                        <div className="h-80 flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillsData}>
                                                    <PolarGrid stroke="var(--color-border)" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                                    <Radar name="Proficiency" dataKey="A" stroke="var(--color-primary)" strokeWidth={3} fill="var(--color-primary)" fillOpacity={0.4} />
                                                    <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Progress Radial */}
                                    <div className="bg-brand-surface p-8 rounded-[2.5rem] shadow-premium border border-brand-border glimmer transition-all">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <h3 className="text-lg font-black text-brand-text uppercase tracking-widest italic transition-colors">Operational Progress</h3>
                                                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">// Sector isolation and completion status</p>
                                            </div>
                                            <PieChart className="w-5 h-5 text-brand-primary opacity-50" />
                                        </div>
                                        <div className="h-80 flex items-center justify-center">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <RadialBarChart innerRadius="25%" outerRadius="100%" barSize={15} data={progressData}>
                                                    <RadialBar minAngle={15} background clockWise dataKey="value" cornerRadius={15} />
                                                    <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ right: 0, top: '50%', transform: 'translate(0, -50%)', lineHeight: '30px' }} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                                                </RadialBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                    {/* Grades Bar Chart */}
                                    <div className="bg-brand-surface p-8 rounded-[2.5rem] shadow-premium border border-brand-border glimmer transition-all">
                                        <h3 className="text-lg font-black text-brand-text mb-8 flex items-center gap-3 uppercase tracking-widest italic transition-colors">
                                            <Award className="w-5 h-5 text-brand-primary" /> Performance Index
                                        </h3>
                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                                                <BarChart data={skillsData}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                                    <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                                                    <Bar dataKey="A" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                        {activeTab === 'leaderboard' && (
                            <motion.div
                                key="leaderboard"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="space-y-8"
                            >
                                <div className="bg-brand-surface p-8 rounded-[2.5rem] shadow-premium border border-brand-border glimmer transition-all">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight italic transition-colors">
                                                Global Top Performance
                                            </h3>
                                            <p className="text-brand-muted font-bold text-xs uppercase tracking-widest mt-1">
                                                The elite tactical learners on the grid
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-brand-primary/10">
                                            <Trophy className="w-8 h-8 text-brand-primary" />
                                        </div>
                                    </div>

                                    {leaderboardLoading ? (
                                        <div className="flex flex-col items-center justify-center py-20">
                                            <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-4" />
                                            <p className="text-brand-muted font-black text-[10px] uppercase tracking-widest">Retrieving Tactical Rankings...</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {leaderboardData.map((item) => (
                                                <LeaderboardCard
                                                    key={item.rank}
                                                    rank={item.rank}
                                                    user={item.username}
                                                    score={item.xp}
                                                    isCurrentUser={item.isCurrentUser}
                                                />
                                            ))}
                                        </div>
                                    )}
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
