import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout,
    Users,
    BookOpen,
    Shield,
    LogOut,
    Bell,
    Search,
    MoreVertical,
    Ban,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Flag,
    Trash2,
    GraduationCap,
    Presentation,
    Plus,
    X,
    Settings
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const { logout, user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeacher, setNewTeacher] = useState({ username: '', email: '', password: '' });

    const [profile, setProfile] = useState({
        username: '',
        email: '',
        profilePicture: ''
    });

    useEffect(() => {
        if (user) {
            setProfile({
                username: user.username || '',
                email: user.email || '',
                profilePicture: user.profilePicture || ''
            });
        }
    }, [user]);

    const handleProfileUpdate = async () => {
        try {
            const res = await axios.put(`${API_URL}/auth/profile`, profile);
            updateUser(res.data);
            alert('IMPERIAL RECORDS UPDATED: Synchronization complete.');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('STRATEGIC FAILURE: Protocol update aborted.');
        }
    };

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    // State for dashboard stats
    const [dashboardStats, setDashboardStats] = useState({
        studentsCount: 0,
        teachersCount: 0,
        coursesCount: 0,
        revenue: 0,
        monthlyEnrollments: []
    });

    // Derived stats for UI
    const stats = [
        { id: 1, label: 'TOTAL POPULATION', value: dashboardStats.studentsCount + dashboardStats.teachersCount, icon: Users, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
        { id: 2, label: 'ACTIVE SECTORS', value: dashboardStats.coursesCount, icon: BookOpen, color: 'text-brand-secondary', bg: 'bg-brand-secondary/10' },
        { id: 3, label: 'IMPERIAL CAPITAL', value: `₹${dashboardStats.revenue.toLocaleString()}`, icon: Shield, color: 'text-brand-primary', bg: 'bg-brand-primary/10' },
        { id: 4, label: 'PENDING PROTOCOLS', value: '0', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    const revenueData = [
        { name: 'Jan', amount: 4000 },
        { name: 'Feb', amount: 3000 },
        { name: 'Mar', amount: 5000 },
        { name: 'Apr', amount: 8000 },
        { name: 'May', amount: 6000 },
        { name: 'Jun', amount: 9000 },
        { name: 'Jul', amount: 11000 },
    ];

    const userDistribution = [
        { name: 'Students', value: students.length || 1, color: '#4f46e5' },
        { name: 'Teachers', value: teachers.length || 1, color: '#8b5cf6' },
        { name: 'Admins', value: 3, color: '#06b6d4' },
    ];

    const [courses, setCourses] = useState([]);
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [courseSearchQuery, setCourseSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
        fetchTeachers();
        fetchDashboardStats();
        fetchCourses();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/stats`);
            setDashboardStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/courses`);
            setCourses(res.data);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/students`);
            setStudents(res.data);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const fetchTeachers = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/teachers`);
            setTeachers(res.data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    const handleCreateTeacher = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/teachers`, newTeacher);
            setShowCreateModal(false);
            setNewTeacher({ username: '', email: '', password: '' });
            fetchTeachers();
            fetchDashboardStats();
            alert('Teacher created successfully!');
        } catch (error) {
            console.error('Error creating teacher:', error);
            alert(error.response?.data?.message || 'Failed to create teacher');
        }
    };

    const handleDeleteUser = async (id, role) => {
        if (!window.confirm(`PROTOCOL WARNING: Are you certain you wish to decommission this ${role}? This action is irreversible and all associated tactical data will be purged.`)) return;

        try {
            await axios.delete(`${API_URL}/admin/users/${id}`);
            if (role === 'Teacher') {
                setTeachers(teachers.filter(t => t._id !== id));
            } else {
                setStudents(students.filter(s => s._id !== id));
            }
            fetchDashboardStats();
            alert('ASSET DECOMMISSIONED: Secure clearing of associated data complete.');
        } catch (error) {
            console.error('Error deleting user:', error);
            alert(error.response?.data?.message || 'Strategic failure during decommissioning.');
        }
    };

    const handleDeleteCourse = async (id) => {
        if (!window.confirm("PROTOCOL WARNING: Permanent decommissioning of this sector intel? This action is irreversible.")) return;

        try {
            await axios.delete(`${API_URL}/admin/courses/${id}`);
            setCourses(courses.filter(c => c._id !== id));
            fetchDashboardStats();
            alert('SECTOR DECOMMISSIONED: Tactical data purged.');
        } catch (error) {
            console.error('Error deleting course:', error);
            alert(error.response?.data?.message || 'Strategic failure during sector removal.');
        }
    };

    const handleBanUser = (username) => {
        alert(`PROTOCOL ENGAGED: Suspension protocol initiated for ${username}. Clearances suspended.`);
    };

    const handleNotificationClick = () => {
        alert("SYSTEM ALERT: No critical breaches detected in current quadrant.");
    };



    const menuItems = [
        { id: 'overview', label: 'GLOBAL GRID', icon: Layout },
        { id: 'students', label: 'CLIENT NODES', icon: GraduationCap },
        { id: 'teachers', label: 'OPERATOR NODES', icon: Presentation },
        { id: 'content', label: 'SECTOR INTEL', icon: BookOpen },
        { id: 'reports', label: 'SYSTEM ALERTS', icon: Flag },
        { id: 'settings', label: 'IMPERIAL SETUP', icon: Settings },
    ];

    // Helper Component for Tables
    const UserTable = ({ title, roleFilter, icon: Icon, data, showAddButton }) => {
        return (
            <div className="bg-brand-surface rounded-[2.5rem] border border-brand-border shadow-2xl overflow-hidden glimmer">
                <div className="p-8 border-b border-brand-border flex flex-col md:flex-row justify-between items-center gap-6 bg-brand-surface-hover">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-brand-primary shadow-xl">
                            <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-black text-brand-text uppercase tracking-tight italic">{title}</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative group w-full sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Scan grid..."
                                value={userSearchQuery}
                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-3 bg-brand-bg border border-brand-border rounded-2xl outline-none focus:border-brand-primary/50 transition-all text-brand-text placeholder-brand-muted font-bold"
                            />
                        </div>
                        {showAddButton && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-brand-primary/90 transition-all shadow-premium"
                            >
                                <Plus className="w-4 h-4" />
                                Initiate Asset
                            </button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-brand-text">
                        <thead className="bg-brand-surface-hover text-brand-muted font-black uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="px-6 py-4">Imperial Handle</th>
                                <th className="px-6 py-4">Comm Link</th>
                                <th className="px-6 py-4">Enlistment Date</th>
                                <th className="px-6 py-4 text-right">Command</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border">
                            {data
                                .filter(user =>
                                    user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                    user.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                                )
                                .map((user) => (
                                    <tr key={user._id} className="hover:bg-brand-surface-hover transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold overflow-hidden ${roleFilter === 'Student' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' : 'bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/30'}`}>
                                                    {user.profilePicture ? (
                                                        <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} alt={user.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        user.username[0].toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-brand-text">{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-brand-muted">{user.email}</td>
                                        <td className="px-6 py-4 text-brand-muted/60">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            <button
                                                onClick={() => handleDeleteUser(user._id, roleFilter)}
                                                className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                                                title="Decommission Asset"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleBanUser(user.username)}
                                                className="p-2 hover:bg-brand-primary/10 text-brand-muted hover:text-brand-primary rounded-lg transition-colors"
                                                title="Suspend Clearances"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            {data.filter(user => user.username.toLowerCase().includes(userSearchQuery.toLowerCase()) || user.email.toLowerCase().includes(userSearchQuery.toLowerCase())).length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-12 text-brand-muted">
                                        No assets found in target sector.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Sub-components
    const OverviewView = () => (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-brand-surface p-8 rounded-[2rem] border border-brand-border shadow-2xl hover:border-brand-primary/40 transition-all group relative overflow-hidden glimmer">
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 shadow-xl transition-all`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="h-1.5 w-12 bg-brand-border rounded-full overflow-hidden">
                                <div className="h-full bg-brand-primary w-2/3" />
                            </div>
                        </div>
                        <div className="relative z-10">
                            <p className="text-brand-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                            <h3 className="text-4xl font-black text-brand-text mt-1 group-hover:text-brand-primary transition-colors uppercase tracking-tight italic">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-2xl glimmer">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-xl font-black text-brand-text uppercase tracking-tight italic">Imperial Capital Yield</h3>
                        <div className="flex gap-2">
                            <span className="w-3 h-3 rounded-full bg-brand-primary" />
                            <span className="w-3 h-3 rounded-full bg-brand-border" />
                        </div>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <AreaChart data={dashboardStats.monthlyEnrollments.length > 0 ? dashboardStats.monthlyEnrollments : revenueData}>
                                <defs>
                                    <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                                <XAxis dataKey={dashboardStats.monthlyEnrollments.length > 0 ? "month" : "name"} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 10, fontWeight: 800 }} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '16px', border: '1px solid var(--color-border)', color: 'var(--color-text)' }} />
                                <Area type="monotone" dataKey={dashboardStats.monthlyEnrollments.length > 0 ? "count" : "amount"} stroke="var(--color-primary)" strokeWidth={5} fillOpacity={1} fill="url(#colorAdminRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-brand-surface p-8 rounded-[2.5rem] border border-brand-border shadow-2xl glimmer transition-all">
                    <h3 className="text-xl font-black text-brand-text mb-10 uppercase tracking-tight italic">Population Spread</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                            <PieChart>
                                <Pie
                                    data={userDistribution}
                                    cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.name === 'Students' ? 'var(--color-primary)' : entry.name === 'Teachers' ? 'var(--color-secondary)' : 'var(--color-muted)'} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderRadius: '12px', border: '1px solid var(--color-border)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 space-y-2">
                            {userDistribution.map(entry => (
                                <div key={entry.name} className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-brand-muted">
                                    <span>{entry.name}</span>
                                    <span className="text-brand-text">{entry.value} UNT</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ContentView = () => (
        <div className="bg-brand-surface rounded-[2.5rem] border border-brand-border shadow-2xl overflow-hidden glimmer transition-all">
            <div className="p-8 border-b border-brand-border flex flex-col md:flex-row justify-between items-center gap-6 bg-brand-surface-hover">
                <h3 className="text-xl font-black text-brand-text uppercase tracking-tight italic">Sector Intel</h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group w-full sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Find sector..."
                            value={courseSearchQuery}
                            onChange={(e) => setCourseSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-6 py-2.5 bg-brand-bg border border-brand-border rounded-xl outline-none focus:border-brand-primary/50 transition-all text-xs text-brand-text placeholder-brand-muted font-bold"
                        />
                    </div>
                    <button className="px-6 py-2.5 bg-brand-surface-hover text-brand-muted rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-bg border border-brand-border transition-all">Filter</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-brand-text">
                    <thead className="bg-brand-surface-hover text-brand-muted font-black uppercase tracking-wider text-[10px]">
                        <tr>
                            <th className="px-6 py-4">Sector Title</th>
                            <th className="px-6 py-4">Lead Instructor</th>
                            <th className="px-6 py-4">Intel Status</th>
                            <th className="px-6 py-4">Deployment</th>
                            <th className="px-6 py-4 text-right">Command</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-border">
                        {courses
                            .filter(course =>
                                course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) ||
                                course.instructor?.username.toLowerCase().includes(courseSearchQuery.toLowerCase())
                            )
                            .map((course) => (
                                <tr key={course._id} className="hover:bg-brand-surface-hover transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-brand-border shadow-sm">
                                                <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} className="w-full h-full object-cover" alt="" />
                                            </div>
                                            <span className="font-bold text-brand-text uppercase tracking-tight">{course.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-brand-text text-xs uppercase tracking-widest">{course.instructor?.username || 'Unknown'}</span>
                                            <span className="text-[10px] text-brand-muted font-bold">{course.instructor?.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${course.status === 'Published' || course.status === 'Active' ? 'bg-brand-primary/10 text-brand-primary' :
                                            course.status === 'Draft' ? 'bg-brand-muted/10 text-brand-muted' : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-brand-muted font-bold text-xs uppercase tracking-widest">
                                        {course.studentsCount || course.students?.length || 0} Assets
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <button
                                            onClick={() => navigate(`/courses/${course._id}`)}
                                            className="p-2.5 bg-brand-surface-hover hover:bg-brand-primary/10 text-brand-primary rounded-xl border border-brand-border transition-all"
                                            title="View Sector"
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCourse(course._id)}
                                            className="p-2.5 bg-brand-surface-hover hover:bg-red-600/10 text-red-500 rounded-xl border border-brand-border transition-all"
                                            title="Decommission Sector"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        {courses.filter(course => course.title.toLowerCase().includes(courseSearchQuery.toLowerCase()) || course.instructor?.username.toLowerCase().includes(courseSearchQuery.toLowerCase())).length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-12 text-brand-muted">
                                    No sector intel found in grid.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-brand-bg overflow-hidden font-jakarta text-brand-text selection:bg-brand-primary selection:text-white relative transition-colors">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/5 dark:bg-blue-600/5 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 dark:bg-cyan-600/5 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                className={`${isSidebarOpen ? 'w-72' : 'w-24'} bg-brand-surface/60 backdrop-blur-2xl border-r border-brand-border z-20 flex flex-col transition-all duration-500 shadow-premium dark:shadow-premium-dark relative`}
            >
                <div className="p-10 flex items-center justify-between">
                    <div className={`flex items-center gap-4 ${!isSidebarOpen && 'justify-center w-full'}`}>
                        <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center shadow-premium border border-brand-primary/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        {isSidebarOpen && <span className="font-black text-2xl tracking-tighter text-brand-text italic uppercase">IMPERIAL</span>}
                    </div>
                </div>

                <div className="flex-1 px-6 py-12 space-y-4">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                ? 'bg-brand-primary text-white shadow-premium'
                                : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface-hover'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${activeTab === item.id ? 'text-white' : 'text-brand-muted group-hover:text-brand-primary'}`} />
                            {isSidebarOpen && <span className="ml-4 font-black text-[10px] uppercase tracking-[0.2em] relative z-10">{item.label}</span>}
                            {activeTab === item.id && (
                                <motion.div layoutId="activeTag" className="absolute left-0 w-1.5 h-full bg-white rounded-r-full" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="p-6 border-t border-brand-border">
                    <button onClick={logout} className="w-full flex items-center p-4 rounded-2xl text-brand-muted hover:text-red-500 hover:bg-red-500/5 transition-all duration-300 group">
                        <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        {isSidebarOpen && <span className="ml-4 font-black text-[10px] uppercase tracking-widest">Terminate Session</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
                {/* Header */}
                <header className="sticky top-0 bg-brand-bg/40 backdrop-blur-2xl z-30 px-10 h-28 flex items-center justify-between border-b border-brand-border transition-colors">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted">Command Core v.1.0 // Online</h4>
                        </div>
                        <h2 className="text-3xl font-black text-brand-text italic tracking-tighter uppercase">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                    </div>

                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => navigate('/create-course')}
                            className="hidden lg:flex items-center gap-2 bg-brand-primary hover:bg-brand-primary/90 text-white px-6 py-3 rounded-2xl font-black text-xs tracking-widest transition-all shadow-premium"
                        >
                            <Plus className="w-4 h-4" /> INITIATE SECTOR
                        </button>
                        <button
                            onClick={handleNotificationClick}
                            className="p-3.5 rounded-2xl bg-brand-surface border border-brand-border text-brand-muted hover:text-brand-primary transition-all relative group shadow-sm"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-red-600 rounded-full border-2 border-brand-surface group-hover:scale-110 transition-transform"></span>
                        </button>
                        <div className="flex items-center gap-4 pl-8 border-l border-brand-border">
                            <div className="text-right">
                                <p className="text-[9px] font-black text-brand-muted uppercase tracking-widest">Overseer Status</p>
                                <p className="text-sm font-black text-brand-text uppercase italic">Administrator</p>
                            </div>
                            <img
                                src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'Admin'}`}
                                className="w-12 h-12 rounded-2xl bg-brand-surface border border-brand-border object-cover cursor-pointer hover:scale-110 transition-transform shadow-premium"
                                alt="Admin"
                                onClick={() => setActiveTab('settings')}
                            />
                        </div>
                    </div>
                </header>

                <div className="p-10 max-w-[1600px] mx-auto">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                        {activeTab === 'overview' && <OverviewView />}
                        {activeTab === 'students' && <UserTable title="Operator Nodes" roleFilter="Student" icon={GraduationCap} data={students} />}
                        {activeTab === 'teachers' && <UserTable title="Master Directory" roleFilter="Teacher" icon={Presentation} data={teachers} showAddButton={true} />}
                        {activeTab === 'content' && <ContentView />}
                        {activeTab === 'reports' && (
                            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-brand-surface rounded-[3rem] border border-brand-border glimmer transition-all">
                                <AlertTriangle className="w-16 h-16 text-brand-muted/20 mb-6" />
                                <h3 className="text-2xl font-black text-brand-text uppercase italic tracking-tighter">Diagnostic Scan in Progress</h3>
                                <p className="text-brand-muted font-black text-[10px] uppercase tracking-widest mt-4">Analyzing Global Metrics...</p>
                            </div>
                        )}
                        {activeTab === 'settings' && (
                            <div className="max-w-4xl mx-auto space-y-10">
                                <div className="bg-brand-surface p-10 rounded-[3rem] border border-brand-border shadow-2xl glimmer transition-all">
                                    <h3 className="text-2xl font-black text-brand-text mb-10 flex items-center gap-4 uppercase italic tracking-tighter">
                                        <Shield className="w-8 h-8 text-brand-primary" /> IMPERIAL CONFIGURATION
                                    </h3>

                                    <div className="space-y-10">
                                        <div className="flex items-center gap-12">
                                            <div className="relative group">
                                                <img
                                                    src={profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'Admin'}`}
                                                    alt="Imperial Profile"
                                                    className="w-40 h-40 rounded-[2.5rem] border-4 border-brand-primary/30 p-1.5 object-cover shadow-premium group-hover:border-brand-primary transition-all duration-500"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 py-2 bg-brand-primary/80 backdrop-blur-md text-[8px] font-black text-white text-center rounded-b-[2rem] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-[0.2em]">Live Feed</div>
                                            </div>
                                            <div className="flex-1 space-y-4">
                                                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest ml-1">Biometric Uplink Source</label>
                                                <input
                                                    type="text"
                                                    value={profile.profilePicture || ''}
                                                    onChange={(e) => setProfile(prev => ({ ...prev, profilePicture: e.target.value }))}
                                                    placeholder="https://image-source.com/imperial-avatar.jpg"
                                                    className="w-full px-8 py-5 bg-brand-bg border border-brand-border rounded-3xl outline-none focus:border-brand-primary/50 transition-all text-sm font-bold text-brand-primary shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div>
                                                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 ml-1">Administrator Handle</label>
                                                <input
                                                    type="text"
                                                    value={profile.username}
                                                    onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                                                    className="w-full px-8 py-5 bg-brand-bg border border-brand-border rounded-3xl outline-none focus:border-brand-primary/50 transition-all text-brand-text font-black uppercase italic"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-4 ml-1">Command Email</label>
                                                <input
                                                    type="email"
                                                    value={profile.email}
                                                    readOnly
                                                    className="w-full px-8 py-5 bg-brand-surface-hover border border-brand-border rounded-3xl text-brand-muted font-black outline-none italic cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-6">
                                    <button
                                        onClick={() => setActiveTab('overview')}
                                        className="px-12 py-5 bg-brand-surface border border-brand-border text-brand-muted rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:text-brand-text transition-all shadow-xl"
                                    >
                                        Abort Change
                                    </button>
                                    <button
                                        onClick={handleProfileUpdate}
                                        className="px-12 py-5 bg-brand-primary text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-brand-primary/90 transition-all shadow-premium"
                                    >
                                        Sync Command Records
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            {/* Create Teacher Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative bg-brand-surface rounded-[3rem] p-12 w-full max-w-xl shadow-premium dark:shadow-premium-dark border border-brand-border overflow-hidden glimmer transition-all"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary" />
                            <div className="flex justify-between items-center mb-10">
                                <div>
                                    <h3 className="text-3xl font-black text-brand-text uppercase italic tracking-tighter">Initialize Node</h3>
                                    <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest mt-1">Register New Master Operator</p>
                                </div>
                                <button onClick={() => setShowCreateModal(false)} className="p-3 hover:bg-brand-surface-hover rounded-2xl transition-all">
                                    <X className="w-6 h-6 text-brand-muted" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTeacher} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-1">Assigned Handle</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTeacher.username}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                                        className="w-full px-6 py-4 bg-brand-bg border border-brand-border rounded-2xl focus:border-brand-primary/50 outline-none transition-all text-brand-text font-bold"
                                        placeholder="OPERATOR_X"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-1">Downlink Link</label>
                                    <input
                                        type="email"
                                        required
                                        value={newTeacher.email}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                        className="w-full px-6 py-4 bg-brand-bg border border-brand-border rounded-2xl focus:border-brand-primary/50 outline-none transition-all text-brand-text font-bold"
                                        placeholder="core@syndicate.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-3 ml-1">Secure Key</label>
                                    <input
                                        type="password"
                                        required
                                        value={newTeacher.password}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                        className="w-full px-6 py-4 bg-brand-bg border border-brand-border rounded-2xl focus:border-brand-primary/50 outline-none transition-all text-brand-text font-bold"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="pt-8 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-4 px-6 bg-brand-surface-hover border border-brand-border text-brand-muted font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-bg transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-4 px-6 bg-brand-primary text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-brand-primary/90 shadow-premium transition-all transform active:scale-95"
                                    >
                                        Confirm Sync
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
