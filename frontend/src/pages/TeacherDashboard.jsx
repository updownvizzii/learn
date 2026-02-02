import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    BookOpen,
    Users,
    DollarSign,
    Settings,
    LogOut,
    Bell,
    Plus,
    MoreVertical,
    Star,
    BarChart2,
    Search,
    Filter,
    Download,
    User,
    Mail,
    Lock,
    Trash2,
    Shield,
    Activity,
    Cpu,
    Radio
} from 'lucide-react';
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
    LineChart,
    Line,
    Legend
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const revenueData = [
    { name: 'Jan', amount: 4000, students: 120 },
    { name: 'Feb', amount: 3000, students: 150 },
    { name: 'Mar', amount: 5000, students: 200 },
    { name: 'Apr', amount: 8000, students: 300 },
    { name: 'May', amount: 6000, students: 250 },
    { name: 'Jun', amount: 9000, students: 400 },
    { name: 'Jul', amount: 11000, students: 450 },
];

const enrollmentData = [
    { name: 'Web Dev', students: 450 },
    { name: 'Python', students: 380 },
    { name: 'React', students: 320 },
    { name: 'UI/UX', students: 290 },
    { name: 'Data Sci', students: 240 },
];

const TeacherDashboard = () => {

    const { logout, user: authUser, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        username: '',
        email: '',
        bio: '',
        upiId: '',
        profilePicture: '',
        role: ''
    });

    const [statsData, setStatsData] = useState({
        totalStudents: 0,
        totalEarnings: 0,
        activeCourses: 0,
        coursePerformance: [],
        monthlyEarnings: []
    });

    // Fetch Teacher's Data & Stats
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const baseUrl = 'http://localhost:5000/api';

                // Fetch Courses
                const coursesRes = await fetch(`${baseUrl}/courses/my-courses`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const coursesData = await coursesRes.json();
                if (Array.isArray(coursesData)) setCourses(coursesData);

                // Fetch Stats
                const statsRes = await fetch(`${baseUrl}/courses/teacher-stats`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const sData = await statsRes.json();
                if (sData) setStatsData(sData);

                // Fetch Profile
                const profileRes = await fetch(`${baseUrl}/auth/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const pData = await profileRes.json();
                if (pData) setProfile(pData);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleDecommission = async (id) => {
        if (!window.confirm('PROTOCOL WARNING: Are you certain you wish to decommission this sector? This action is irreversible and all tactical data will be purged.')) return;

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`http://localhost:5000/api/courses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                setCourses(courses.filter(c => c._id !== id));
                alert('SECTOR DECOMMISSIONED: Tactical cleanup successful.');
            } else {
                const contentType = response.headers.get('content-type');
                let errorMessage = 'Decommissioning aborted.';
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    errorMessage = data.message || errorMessage;
                } else {
                    const text = await response.text();
                    console.error('Error response text:', text);
                    errorMessage = `System Error (${response.status})`;
                }
                alert(`STRATEGIC FAILURE: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Decommission Error:', error);
            alert('SYSTEM ERROR: Failed to communicate with Command Core.');
        }
    };

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
                alert('PROFILE SYNCED: Tactical records updated in Command Core.');
            } else {
                alert(data.message || 'STRATEGIC FAILURE: Protocol update aborted.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const stats = [
        { id: 1, label: 'TOTAL CAPITAL', value: `₹${statsData.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
        { id: 2, label: 'CLIENT BASE', value: statsData.totalStudents.toString(), icon: Users, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
        { id: 3, label: 'ACTIVE DOMAINS', value: statsData.activeCourses.toString(), icon: BookOpen, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
        { id: 4, label: 'CORE SECTORS', value: statsData.totalCourses?.toString() || '0', icon: BarChart2, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
    ];

    const transactions = [
        { id: 1, date: '2023-10-25', course: 'Complete Web Development', amount: '+$49.99', status: 'Completed' },
        { id: 2, date: '2023-10-24', course: 'Python for Data Science', amount: '+$39.99', status: 'Completed' },
        { id: 3, date: '2023-10-24', course: 'Advanced React Patterns', amount: '+$59.99', status: 'Pending' },
        { id: 4, date: '2023-10-23', course: 'UI/UX Design Masterclass', amount: '+$29.99', status: 'Completed' },
    ];

    const menuItems = [
        { id: 'overview', label: 'COMMAND CENTER', icon: Layout },
        { id: 'imperial', label: 'IMPERIAL INTERFACE', icon: Shield },
        { id: 'my-courses', label: 'ACTIVE SECTORS', icon: BookOpen },
        { id: 'analytics', label: 'STRATEGIC DATA', icon: BarChart2 },
        { id: 'wallet', label: 'CAPITAL GAIN', icon: DollarSign },
        { id: 'settings', label: 'PROTOCOL SETUP', icon: Settings },
    ];

    // --- Sub-Components for Views ---

    const ImperialInterfaceView = () => (
        <div className="h-[70vh] flex items-center justify-center relative overflow-hidden bg-brand-surface rounded-[3rem] border border-brand-border shadow-premium transition-all glimmer">
            {/* Tactical Hex Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: `radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />

            {/* Scanning Line Animation */}
            <motion.div
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-[2px] bg-brand-primary/20 shadow-[0_0_20px_var(--color-primary)] z-10"
            />

            {/* Corner Frames */}
            <div className="absolute top-10 left-10 w-24 h-24 border-t-2 border-l-2 border-brand-primary/30 rounded-tl-xl" />
            <div className="absolute top-10 right-10 w-24 h-24 rotate-90 border-t-2 border-l-2 border-brand-primary/30 rounded-tl-xl" />
            <div className="absolute bottom-10 left-10 w-24 h-24 -rotate-90 border-t-2 border-l-2 border-brand-primary/30 rounded-tl-xl" />
            <div className="absolute bottom-10 right-10 w-24 h-24 border-b-2 border-r-2 border-brand-primary/30 rounded-br-xl" />

            <div className="relative z-20 flex flex-col items-center">
                {/* Central Shield Orb */}
                <div className="relative mb-12">
                    <motion.div
                        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 bg-brand-primary/20 blur-[60px] rounded-full"
                    />
                    <div className="w-48 h-48 rounded-full bg-brand-bg border border-brand-primary/30 flex items-center justify-center shadow-premium relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent" />
                        <Shield className="w-20 h-20 text-brand-primary group-hover:scale-110 transition-transform duration-500" />
                    </div>
                </div>

                {/* Interface Text */}
                <div className="text-center space-y-4">
                    <motion.h2
                        initial={{ opacity: 0, tracking: '0.5em' }}
                        animate={{ opacity: 1, tracking: '1em' }}
                        className="text-brand-primary font-black text-sm uppercase transition-all duration-1000 pl-[1em]"
                    >
                        IMPERIAL COMMAND INTERFACE
                    </motion.h2>
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-[1px] w-8 bg-brand-border" />
                        <p className="text-brand-muted font-black text-[10px] uppercase tracking-[0.2em] italic">
                            SYSTEM MONITORING V.2.4.0 // <span className="text-emerald-500">SECURE UPLINK</span>
                        </p>
                        <div className="h-[1px] w-8 bg-brand-border" />
                    </div>
                </div>

                {/* Tactical Mini-Widgets */}
                <div className="mt-16 grid grid-cols-3 gap-12">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Activity className="w-3 h-3 text-brand-primary" />
                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Latency</span>
                        </div>
                        <p className="text-brand-text font-black text-xs uppercase tracking-tighter italic transition-colors">24ms <span className="text-brand-primary">Nominal</span></p>
                    </div>
                    <div className="text-center border-x border-brand-border px-12 transition-colors">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Cpu className="w-3 h-3 text-brand-primary" />
                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Enclave</span>
                        </div>
                        <p className="text-brand-text font-black text-xs uppercase tracking-tighter italic transition-colors">Encrypted <span className="text-brand-primary">Live</span></p>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Radio className="w-3 h-3 text-brand-primary" />
                            <span className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Signal</span>
                        </div>
                        <p className="text-brand-text font-black text-xs uppercase tracking-tighter italic transition-colors">4.9GHz <span className="text-brand-primary">Stable</span></p>
                    </div>
                </div>
            </div>
        </div>
    );

    const OverviewView = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-brand-surface p-8 rounded-[2rem] border border-brand-border shadow-premium dark:shadow-premium-dark hover:border-brand-primary/40 transition-all group relative overflow-hidden glimmer">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className={`p-4 rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:scale-110 shadow-xl transition-all`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">+12% ACCEL</span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1 transition-colors">{stat.label}</p>
                            <h3 className="text-4xl font-black text-brand-text mt-1 group-hover:text-brand-primary transition-colors uppercase tracking-tight">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium glimmer transition-all">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-brand-text uppercase tracking-tight italic transition-colors">Domain Capital Yield</h3>
                        <select className="bg-brand-bg border border-brand-border text-brand-muted rounded-xl text-[10px] font-black px-4 py-2 uppercase tracking-widest outline-none focus:border-brand-primary/50 transition-all">
                            <option>Annual Scan</option>
                            <option>Quarterly Scan</option>
                        </select>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={statsData.monthlyEarnings}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                                <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={5} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium glimmer transition-all">
                    <h3 className="text-xl font-black text-brand-text mb-10 uppercase tracking-tight italic transition-colors">Unit Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <BarChart data={statsData.coursePerformance}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }} />
                                <Bar dataKey="students" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface rounded-[2.5rem] border border-brand-border shadow-2xl overflow-hidden glimmer">
                <div className="p-8 border-b border-brand-border flex justify-between items-center">
                    <h3 className="text-xl font-black text-brand-text uppercase tracking-tight italic">Active Sectors</h3>
                    <button
                        onClick={() => navigate('/teacher/create-course')}
                        className="flex items-center px-6 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium hover:bg-brand-primary/90 transition-all"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Initiate Sector
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-brand-text">
                        <thead className="bg-brand-surface-hover text-brand-muted font-black uppercase tracking-widest text-[10px] border-b border-brand-border">
                            <tr>
                                <th className="px-8 py-5">Sector Name</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Units</th>
                                <th className="px-8 py-5">Capital</th>
                                <th className="px-8 py-5">Rating</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {courses.slice(0, 4).map((course) => (
                                <tr key={course._id} className="hover:bg-brand-bg/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} alt="" className="w-12 h-12 rounded-xl object-cover border border-brand-border" />
                                            <span className="font-bold text-brand-text transition-colors">{course.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${course.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-bg text-brand-muted border border-brand-border'}`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-brand-text transition-colors">{course.students ? course.students.length : 0}</td>
                                    <td className="px-8 py-5 font-bold text-brand-text transition-colors">₹{(course.price || 0) * (course.students ? course.students.length : 0)}</td>
                                    <td className="px-8 py-5 flex items-center gap-1">
                                        <Star className="w-4 h-4 text-brand-primary fill-current" />
                                        <span className="text-brand-text font-bold transition-colors">{course.rating || '0.0'}</span>
                                    </td>
                                    <td className="px-8 py-5 text-right flex justify-end gap-2">
                                        <button
                                            onClick={() => navigate(`/teacher/edit-course/${course._id}`)}
                                            className="text-brand-muted hover:text-brand-primary p-2 rounded-lg hover:bg-brand-bg transition-all"
                                            title="Modify Asset"
                                        >
                                            <Settings className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDecommission(course._id)}
                                            className="text-brand-muted hover:text-red-500 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                                            title="Decommission Sector"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const MyCoursesView = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-brand-surface p-6 rounded-[2.5rem] border border-brand-border shadow-premium transition-all glimmer">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
                    <input
                        type="text"
                        placeholder="Access database..."
                        className="w-full pl-14 pr-6 py-3.5 bg-brand-bg border border-brand-border rounded-2xl outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary/50 transition-all text-brand-text placeholder:text-brand-muted/20"
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button className="p-3.5 bg-brand-bg rounded-2xl border border-brand-border text-brand-muted hover:bg-brand-surface hover:text-brand-text transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/teacher/create-course')}
                        className="flex items-center px-6 py-3.5 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-premium hover:bg-brand-primary/90 transition transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Initiate Sector
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => (
                    <div key={course._id} className="bg-brand-surface rounded-[2.5rem] border border-brand-border shadow-premium overflow-hidden hover:border-brand-primary/40 transition-all duration-300 group glimmer">
                        <div className="relative h-56 overflow-hidden">
                            <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-6 right-6 bg-brand-surface/80 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-black text-brand-text uppercase tracking-widest border border-brand-border">
                                {course.students ? course.students.length : 0} Units
                            </div>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest ${course.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-brand-muted/10 text-brand-muted'}`}>
                                    {course.status}
                                </span>
                                <div className="flex items-center text-brand-primary text-xs font-black uppercase tracking-widest">
                                    <Star className="w-4 h-4 mr-1 fill-current" /> {course.rating || '0.0'}
                                </div>
                            </div>
                            <h3 className="font-black text-brand-text text-xl mb-3 line-clamp-2 italic transition-colors">{course.title}</h3>
                            <div className="flex items-center justify-between mt-6">
                                <span className="font-black text-2xl text-brand-primary">₹{(course.price || 0) * (course.students ? course.students.length : 0)}</span>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/teacher/edit-course/${course._id}`)}
                                        className="text-brand-muted hover:text-brand-primary p-3 rounded-xl hover:bg-brand-bg transition-all"
                                        title="Modify Asset"
                                    >
                                        <Settings className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDecommission(course._id)}
                                        className="text-brand-muted hover:text-red-500 p-3 rounded-xl hover:bg-red-500/10 transition-all"
                                        title="Decommission Sector"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const AnalyticsView = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium glimmer transition-all">
                    <h3 className="text-xl font-black text-brand-text mb-6 uppercase tracking-tight italic transition-colors">Unit Acquisition Trajectory</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                                <Line type="monotone" dataKey="students" stroke="var(--color-primary)" strokeWidth={5} dot={{ r: 4, strokeWidth: 0, fill: 'var(--color-primary)' }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium glimmer transition-all">
                    <h3 className="text-xl font-black text-brand-text mb-6 uppercase tracking-tight italic transition-colors">System Access Points</h3>
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center text-brand-muted">
                            <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p className="font-bold text-sm uppercase tracking-widest">Detailed system access analytics coming soon.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium glimmer transition-all">
                <h3 className="text-xl font-black text-brand-text mb-6 uppercase tracking-tight italic transition-colors">Capital Flow Overview</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={statsData.monthlyEarnings}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                            <Bar dataKey="amount" fill="var(--color-primary)" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const WalletView = () => (
        <div className="space-y-12">
            <div className="bg-brand-surface border-2 border-brand-primary rounded-[3rem] p-12 text-brand-text shadow-premium glimmer relative overflow-hidden transition-all">
                <div className="absolute top-0 right-0 p-8">
                    <div className="w-20 h-20 bg-brand-primary/10 rounded-full blur-3xl" />
                </div>
                <p className="text-brand-primary font-black text-[10px] uppercase tracking-[0.5em] mb-6">// AGGREGATED RESOURCE POOL</p>
                <div className="flex items-end gap-6 mb-12">
                    <h2 className="text-8xl font-black italic tracking-tighter uppercase">₹{statsData.totalEarnings || '0.00'}</h2>
                    <span className="mb-4 bg-brand-primary/10 border border-brand-primary/30 px-5 py-2 rounded-2xl text-xs font-black text-brand-primary uppercase tracking-widest">+24% VELOCITY</span>
                </div>
                <div className="flex gap-6 relative z-10">
                    <button className="bg-brand-primary text-white px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-brand-primary/90 transition-all shadow-premium">Initiate Extraction</button>
                    <button className="bg-brand-bg border border-brand-border text-brand-muted px-10 py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:text-brand-text transition-all flex items-center gap-3">
                        <Download className="w-5 h-5" /> Export Log
                    </button>
                </div>
            </div>

            <div className="bg-brand-surface rounded-[3rem] border border-brand-border shadow-premium overflow-hidden glimmer transition-all">
                <div className="p-10 border-b border-brand-border flex justify-between items-center bg-brand-bg/40">
                    <h3 className="text-2xl font-black text-brand-text uppercase tracking-tight italic transition-colors">RESOURCE TRANSFER LOG</h3>
                    <div className="flex gap-4">
                        <div className="px-5 py-2.5 bg-brand-bg border border-brand-border rounded-xl text-[10px] font-black text-brand-muted uppercase tracking-widest">
                            {transactions.length} ENTRIES FOUND
                        </div>
                    </div>
                </div>
                <div className="divide-y divide-brand-border">
                    {transactions.map(tx => (
                        <div key={tx.id} className="p-10 flex items-center justify-between hover:bg-brand-bg/50 transition-all group">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-brand-bg border border-brand-border rounded-2xl flex items-center justify-center group-hover:border-brand-primary/30 transition-all">
                                    <DollarSign className="w-6 h-6 text-brand-primary" />
                                </div>
                                <div>
                                    <h4 className="font-black text-brand-text text-xl uppercase italic tracking-tight transition-colors">{tx.course || tx.Payout}</h4>
                                    <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1 transition-colors">TIMESTAMP: {tx.date}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`block font-black text-3xl italic tracking-tighter transition-colors ${tx.amount.startsWith('+') ? 'text-brand-primary' : 'text-brand-text'}`}>
                                    {tx.amount}
                                </span>
                                <div className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-end gap-2 text-brand-muted transition-colors">
                                    <div className={`w-2 h-2 rounded-full ${tx.status === 'Completed' || tx.status === 'Processed' ? 'bg-brand-primary' : 'bg-brand-secondary'}`} />
                                    {tx.status}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const SettingsView = () => (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium glimmer transition-all">
                <h3 className="text-xl font-black text-brand-text mb-8 flex items-center gap-3 uppercase tracking-tight italic transition-colors">
                    <User className="w-6 h-6 text-brand-primary" /> Operator Profile
                </h3>
                <div className="space-y-6">
                    <div className="flex items-center gap-6 mb-8">
                        <img src={profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'default'}`} alt="Profile" className="w-24 h-24 rounded-full border-4 border-brand-border p-0.5 object-cover transition-all" />
                        <div className="flex-1 space-y-2">
                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest">Biometric Uplink URL</label>
                            <input
                                type="text"
                                value={profile.profilePicture || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, profilePicture: e.target.value }))}
                                placeholder="https://image-source.com/avatar.jpg"
                                className="w-full px-6 py-3 bg-brand-bg border border-brand-border rounded-xl outline-none focus:border-brand-primary/50 text-brand-text text-xs font-bold transition-all"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-black text-brand-muted uppercase tracking-widest mb-2 transition-colors">Operator Handle</label>
                            <input
                                type="text"
                                value={profile.username}
                                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full px-6 py-3.5 rounded-xl border border-brand-border bg-brand-bg focus:border-brand-primary/50 outline-none text-brand-text placeholder:text-brand-muted/40 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-black text-brand-muted uppercase tracking-widest mb-2 transition-colors">Capital Transfer ID</label>
                            <input
                                type="text"
                                value={profile.upiId || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, upiId: e.target.value }))}
                                placeholder="yourname@upi"
                                className="w-full px-6 py-3.5 rounded-xl border border-brand-border bg-brand-bg focus:border-brand-primary/50 font-bold text-brand-primary outline-none placeholder:text-brand-muted/40 transition-all font-bold"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-black text-brand-muted uppercase tracking-widest mb-2 transition-colors">Bio-Signature</label>
                        <textarea
                            rows="4"
                            value={profile.bio || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                            className="w-full px-6 py-3.5 rounded-xl border border-brand-border bg-brand-bg focus:border-brand-primary/50 outline-none text-brand-text placeholder:text-brand-muted/40 transition-all"
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-premium glimmer transition-all">
                <h3 className="text-xl font-black text-brand-text mb-8 flex items-center gap-3 uppercase tracking-tight italic transition-colors">
                    <Lock className="w-6 h-6 text-brand-primary" /> Access Protocol
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-black text-brand-muted uppercase tracking-widest mb-2 transition-colors">Secure Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
                            <input
                                type="email"
                                value={profile.email}
                                readOnly
                                className="w-full pl-14 pr-6 py-3.5 rounded-xl border border-brand-border bg-brand-bg outline-none text-brand-text transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button className="px-8 py-4 bg-brand-surface text-brand-muted rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-bg transition-all border border-brand-border">Cancel</button>
                <button
                    onClick={handleProfileUpdate}
                    className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-premium"
                >
                    Save Protocol
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-brand-bg font-jakarta text-brand-text flex overflow-hidden relative transition-colors">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isSidebarOpen ? 280 : 0 }}
                className="bg-brand-surface border-r border-brand-border flex flex-col fixed h-full z-40 transition-all duration-300 overflow-hidden"
            >
                <div className="p-8 pb-10 flex items-center shrink-0">
                    <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-premium">
                        F
                    </div>
                    <span className="ml-4 font-black text-xl text-brand-text tracking-tighter">OPERATOR</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center p-4 rounded-2xl transition-all group ${activeTab === item.id
                                ? 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20 shadow-xl'
                                : 'text-brand-muted hover:bg-brand-surface-hover hover:text-brand-text'
                                }`}
                        >
                            <item.icon className="w-5 h-5 shrink-0" />
                            <span className="ml-4 font-black text-xs uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-brand-border">
                    <div className="bg-brand-surface-hover rounded-3xl p-4 mb-4 border border-brand-border">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full border border-brand-primary/30 p-0.5">
                                <img src={profile.profilePicture || "https://api.dicebear.com/7.x/notionists/svg?seed=Teacher"} className="w-full h-full rounded-full" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-black text-brand-text truncate uppercase tracking-tight">{profile.username}</p>
                                <p className="text-[10px] text-brand-muted font-bold uppercase tracking-widest">Master Operator</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={logout} className="w-full flex items-center p-3.5 rounded-2xl text-red-500 hover:bg-red-500/5 transition-all group">
                        <LogOut className="w-5 h-5" />
                        <span className="ml-3 font-black text-xs tracking-widest">TERMINATE SESSION</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div className={`flex-1 ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'} transition-all duration-300 flex flex-col min-h-screen relative z-10`}>
                {/* Topbar */}
                <header className="h-24 bg-brand-surface/60 backdrop-blur-2xl sticky top-0 z-30 border-b border-brand-border px-10 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2.5 bg-brand-surface rounded-xl border border-brand-border text-brand-muted hover:text-brand-text transition-all">
                            <Layout className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl font-black text-brand-text tracking-tight uppercase italic underline decoration-brand-primary decoration-4 underline-offset-8">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center bg-brand-surface border border-brand-border rounded-2xl px-4 py-2.5 w-64 shadow-xl focus-within:border-brand-primary/50 transition-all">
                            <Search className="w-4 h-4 text-brand-muted" />
                            <input type="text" placeholder="Access database..." className="bg-transparent border-none focus:outline-none text-sm ml-3 w-full text-brand-text placeholder-brand-muted" />
                        </div>
                        <button onClick={() => navigate('/create-course')} className="hidden lg:flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-2.5 rounded-2xl font-black text-xs tracking-widest transition-all shadow-premium">
                            <Plus className="w-4 h-4" /> INITIATE SECTOR
                        </button>
                        <button className="relative p-2.5 bg-brand-surface rounded-xl border border-brand-border text-brand-muted hover:text-brand-text transition-all shadow-lg">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-primary rounded-full"></span>
                        </button>
                        <div className="flex items-center gap-4 pl-6 border-l border-brand-border">
                            <div className="text-right hidden sm:block">
                                <p className="text-brand-text font-black text-[10px] uppercase tracking-wider">{authUser?.username || 'Operator'}</p>
                                <p className="text-brand-primary font-black text-[9px] uppercase tracking-widest italic">{authUser?.role || 'Imperial Tutor'}</p>
                            </div>
                            <img
                                src={authUser?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser?.username || 'Felix'}`}
                                className="w-12 h-12 rounded-xl border border-brand-border object-cover cursor-pointer hover:scale-110 transition-transform"
                                alt="Operator"
                                onClick={() => setActiveTab('settings')}
                            />
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-10 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <OverviewView />
                            </motion.div>
                        )}
                        {activeTab === 'imperial' && (
                            <motion.div key="imperial" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
                                <ImperialInterfaceView />
                            </motion.div>
                        )}
                        {activeTab === 'my-courses' && (
                            <motion.div key="my-courses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <MyCoursesView />
                            </motion.div>
                        )}
                        {activeTab === 'analytics' && (
                            <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <AnalyticsView />
                            </motion.div>
                        )}
                        {activeTab === 'wallet' && (
                            <motion.div key="wallet" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <WalletView />
                            </motion.div>
                        )}
                        {activeTab === 'settings' && (
                            <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                <SettingsView />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default TeacherDashboard;
