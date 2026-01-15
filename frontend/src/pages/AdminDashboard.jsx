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
    X
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
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeacher, setNewTeacher] = useState({ username: '', email: '', password: '' });

    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    // State for dashboard stats
    const [dashboardStats, setDashboardStats] = useState({
        studentsCount: 0,
        teachersCount: 0,
        coursesCount: 0,
        revenue: 0
    });

    // Derived stats for UI
    const stats = [
        { id: 1, label: 'Total Users', value: dashboardStats.studentsCount + dashboardStats.teachersCount, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 2, label: 'Active Courses', value: dashboardStats.coursesCount, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 3, label: 'Total Revenue', value: `$${dashboardStats.revenue.toLocaleString()}`, icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 4, label: 'Pending Approvals', value: '0', icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
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
            alert('Teacher created successfully!');
        } catch (error) {
            console.error('Error creating teacher:', error);
            alert(error.response?.data?.message || 'Failed to create teacher');
        }
    };



    const menuItems = [
        { id: 'overview', label: 'Overview', icon: Layout },
        { id: 'students', label: 'Students', icon: GraduationCap },
        { id: 'teachers', label: 'Teachers', icon: Presentation },
        { id: 'content', label: 'Course Management', icon: BookOpen },
        { id: 'reports', label: 'Reports', icon: Flag },
    ];

    // Helper Component for Tables
    const UserTable = ({ title, roleFilter, icon: Icon, data, showAddButton }) => {
        return (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                            <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative hidden md:block">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                            <input type="text" placeholder={`Search ${title.toLowerCase()}...`} className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all w-64" />
                        </div>
                        {showAddButton && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                <Plus className="w-4 h-4" />
                                Add {roleFilter}
                            </button>
                        )}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold overflow-hidden ${roleFilter === 'Student' ? 'bg-indigo-100 text-indigo-600' : 'bg-purple-100 text-purple-600'}`}>
                                                {user.profilePicture ? (
                                                    <img src={user.profilePicture} alt={user.username} className="w-full h-full object-cover" />
                                                ) : (
                                                    user.username[0].toUpperCase()
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                    <td className="px-6 py-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                                        <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Ban User">
                                            <Ban className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-gray-400">
                                        No {title.toLowerCase()} found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    // Sub-components
    const OverviewView = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Platform Growth</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorAdminRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Area type="monotone" dataKey="amount" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorAdminRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">User Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={userDistribution}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {userDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 text-xs font-bold text-gray-500 mt-4">
                            {userDistribution.map(item => (
                                <div key={item.name} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ContentView = () => (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900">Course Management</h3>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200">Filter</button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-4">Title</th>
                            <th className="px-6 py-4">Instructor</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Sales</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {courses.map((course) => (
                            <tr key={course._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900">{course.title}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-gray-700">{course.instructor?.username || 'Unknown'}</span>
                                        <span className="text-xs text-gray-500">{course.instructor?.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${course.status === 'Published' || course.status === 'Active' ? 'bg-green-100 text-green-700' :
                                            course.status === 'Draft' ? 'bg-gray-100 text-gray-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {course.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    {course.students?.length || 0}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-2">
                                    <button className="p-2 hover:bg-green-50 text-green-600 rounded-lg" title="View Details">
                                        <BookOpen className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-red-50 text-red-500 rounded-lg" title="Delete">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {courses.length === 0 && (
                            <tr>
                                <td colSpan="5" className="text-center py-8 text-gray-400">
                                    No courses found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-gray-900">
            {/* Background Blobs (Different Color for Admin) */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-200/30 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white/80 backdrop-blur-xl border-r border-gray-100 z-20 flex flex-col transition-all duration-300 shadow-xl shadow-blue-100/20`}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-200">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-gray-900">EduAdmin</span>}
                    </div>
                </div>

                <div className="flex-1 px-4 py-8 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-blue-600'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                            {isSidebarOpen && <span className="ml-3 font-medium text-sm relative z-10">{item.label}</span>}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={logout} className="w-full flex items-center p-3 rounded-2xl text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all duration-300 group">
                        <LogOut className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        {isSidebarOpen && <span className="ml-3 font-medium text-sm">Logout</span>}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative z-10">
                {/* Header */}
                <header className="sticky top-0 bg-[#f8fafc]/80 backdrop-blur-md z-30 px-8 py-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                        <p className="text-gray-500 text-sm">Platform Administration</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-full bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold">A</div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {activeTab === 'overview' && <OverviewView />}
                        {activeTab === 'students' && <UserTable title="Students" roleFilter="Student" icon={GraduationCap} data={students} />}
                        {activeTab === 'teachers' && <UserTable title="Teachers" roleFilter="Teacher" icon={Presentation} data={teachers} showAddButton={true} />}
                        {activeTab === 'content' && <ContentView />}
                        {activeTab === 'reports' && <div className="text-center text-gray-500 py-20">Reports generating...</div>}
                    </motion.div>
                </div>
            </main>

            {/* Create Teacher Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold text-gray-900">Add New Teacher</h3>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTeacher} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={newTeacher.username}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. Sarah Smith"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={newTeacher.email}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="e.g. sarah@edusys.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={newTeacher.password}
                                        onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Min. 6 characters"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all transform active:scale-95"
                                    >
                                        Create Teacher
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
