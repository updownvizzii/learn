import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
    Lock
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

    const { logout, user: authUser } = useAuth();
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
        role: ''
    });

    // Fetch Teacher's Data & Profile
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('accessToken');

                // Fetch Courses
                const coursesRes = await fetch('http://localhost:5000/api/courses/my-courses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const coursesData = await coursesRes.json();
                if (Array.isArray(coursesData)) setCourses(coursesData);

                // Fetch Profile
                const profileRes = await fetch('http://localhost:5000/api/auth/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const profileData = await profileRes.json();
                if (profileData) setProfile(profileData);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                alert('Profile updated successfully!');
            } else {
                alert(data.message || 'Update failed');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    // Calculate Stats from Real Data
    const totalStudents = courses.reduce((acc, course) => acc + (course.students ? course.students.length : 0), 0);
    const totalRevenueValue = courses.reduce((acc, course) => acc + ((course.price || 0) * (course.students ? course.students.length : 0)), 0);
    const activeCoursesCount = courses.filter(c => c.status === 'Active').length;
    const avgRating = courses.length > 0 ? (courses.reduce((acc, c) => acc + (c.rating || 0), 0) / courses.length).toFixed(1) : '0.0';

    const stats = [
        { id: 1, label: 'Total Revenue', value: `₹${totalRevenueValue}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { id: 2, label: 'Total Students', value: totalStudents.toString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 3, label: 'Course Rating', value: avgRating, icon: Star, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { id: 4, label: 'Active Courses', value: activeCoursesCount.toString(), icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const transactions = [
        { id: 1, date: '2023-10-25', course: 'Complete Web Development', amount: '+$49.99', status: 'Completed' },
        { id: 2, date: '2023-10-24', course: 'Python for Data Science', amount: '+$39.99', status: 'Completed' },
        { id: 3, date: '2023-10-24', course: 'Advanced React Patterns', amount: '+$59.99', status: 'Pending' },
        { id: 4, date: '2023-10-23', course: 'UI/UX Design Masterclass', amount: '+$29.99', status: 'Completed' },
        { id: 5, date: '2023-10-23', Payout: 'Withdrawal to Bank ****1234', amount: '-$1,200.00', status: 'Processed' },
    ];

    const menuItems = [
        { id: 'overview', label: 'Overview', icon: Layout },
        { id: 'my-courses', label: 'My Courses', icon: BookOpen },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'wallet', label: 'Earnings', icon: DollarSign },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    // --- Sub-Components for Views ---

    const OverviewView = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <div key={stat.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">+12% this month</span>
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
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Revenue Analytics</h3>
                        <select className="bg-gray-50 border border-gray-200 rounded-lg text-sm px-3 py-1 outline-none focus:border-indigo-500">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#4f46e5', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Top Performing Courses</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={enrollmentData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#4b5563', fontWeight: 500, fontSize: 12 }} width={70} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                                <Bar dataKey="students" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-900">Your Courses</h3>
                    <button
                        onClick={() => navigate('/teacher/create-course')}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm hover:bg-indigo-700 transition"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Create New Course
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-6 py-4">Course Name</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Students</th>
                                <th className="px-6 py-4">Revenue</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {courses.slice(0, 4).map((course) => (
                                <tr key={course._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="font-semibold text-gray-900">{course.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">{course.students ? course.students.length : 0}</td>
                                    <td className="px-6 py-4 font-medium">₹{(course.price || 0) * (course.students ? course.students.length : 0)}</td>
                                    <td className="px-6 py-4 flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        {course.rating || '0.0'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-gray-400 hover:text-indigo-600"><MoreVertical className="w-5 h-5" /></button>
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
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-gray-50 rounded-2xl text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition">
                        <Filter className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => navigate('/teacher/create-course')}
                        className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition transform hover:-translate-y-0.5"
                    >
                        <Plus className="w-5 h-5 mr-2" /> New Course
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                    <div key={course._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group">
                        <div className="relative h-48 overflow-hidden">
                            <img src={course.thumbnail ? (course.thumbnail.startsWith('http') ? course.thumbnail : `http://localhost:5000${course.thumbnail}`) : 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&q=80'} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-900">
                                {course.students ? course.students.length : 0} Students
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {course.status}
                                </span>
                                <div className="flex items-center text-yellow-500 text-xs font-bold">
                                    <Star className="w-4 h-4 mr-1 fill-current" /> {course.rating || '0.0'}
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                            <div className="flex items-center justify-between mt-6">
                                <span className="font-bold text-lg text-indigo-600">₹{(course.price || 0) * (course.students ? course.students.length : 0)}</span>
                                <button className="text-gray-400 hover:text-indigo-600 p-2 rounded-lg hover:bg-gray-50">
                                    <Settings className="w-5 h-5" />
                                </button>
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
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Student Enrollment Growth</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                <Line type="monotone" dataKey="students" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 4, strokeWidth: 0 }} activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Device Usage</h3>
                    <div className="h-80 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                            <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                            <p>Detailed device analytics coming soon.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue Overview</h3>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={revenueData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af' }} />
                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                            <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );

    const EarningsView = () => (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-10 text-white shadow-xl shadow-indigo-200">
                <p className="text-indigo-100 font-medium mb-2">Total Life-time Earnings</p>
                <div className="flex items-end gap-4">
                    <h2 className="text-5xl font-bold">$12,450.00</h2>
                    <span className="mb-2 bg-white/20 px-3 py-1 rounded-lg text-sm font-medium">+15% vs last month</span>
                </div>
                <div className="mt-8 flex gap-4">
                    <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition shadow-lg">Withdraw Funds</button>
                    <button className="bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-800 transition flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download Statement
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {transactions.map(tx => (
                        <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                            <div>
                                <h4 className="font-bold text-gray-900">{tx.course || tx.Payout}</h4>
                                <p className="text-sm text-gray-500">{tx.date}</p>
                            </div>
                            <div className="text-right">
                                <span className={`block font-bold text-lg ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-gray-900'}`}>
                                    {tx.amount}
                                </span>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${tx.status === 'Completed' || tx.status === 'Processed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const SettingsView = () => (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <User className="w-6 h-6 text-indigo-600" /> Profile Information
                </h3>
                <div className="space-y-6">
                    <div className="flex items-center gap-6 mb-8">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'default'}`} alt="Profile" className="w-24 h-24 rounded-full border-4 border-gray-100" />
                        <button className="px-5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-100 transition">Change Photo</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={profile.username}
                                onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">UPI ID (for payments)</label>
                            <input
                                type="text"
                                value={profile.upiId || ''}
                                onChange={(e) => setProfile(prev => ({ ...prev, upiId: e.target.value }))}
                                placeholder="yourname@upi"
                                className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 font-bold text-indigo-600 outline-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Bio</label>
                        <textarea
                            rows="4"
                            value={profile.bio || ''}
                            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                            className="w-full px-5 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none"
                        ></textarea>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <Lock className="w-6 h-6 text-indigo-600" /> Security
                </h3>
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input
                                type="email"
                                value={profile.email}
                                readOnly
                                className="w-full pl-12 pr-5 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-4">
                <button className="px-8 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                <button
                    onClick={handleProfileUpdate}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-gray-900">
            {/* Background Blobs */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]" />
            </div>

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -250 }}
                animate={{ x: 0 }}
                className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white/80 backdrop-blur-xl border-r border-gray-100 z-20 flex flex-col transition-all duration-300 shadow-xl shadow-indigo-100/20`}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        {isSidebarOpen && <span className="font-bold text-xl tracking-tight text-gray-900">EduPro</span>}
                    </div>
                </div>

                <div className="flex-1 px-4 py-8 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden ${activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                : 'text-gray-500 hover:bg-white hover:shadow-sm hover:text-indigo-600'
                                }`}
                        >
                            <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-indigo-600'}`} />
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
                            {activeTab === 'overview' ? 'Instructor Dashboard' :
                                activeTab === 'my-courses' ? 'My Courses' :
                                    activeTab === 'analytics' ? 'Analytics' :
                                        activeTab === 'wallet' ? 'Earnings & Wallet' :
                                            'Settings'}
                        </h2>
                        <p className="text-gray-500 text-sm">Welcome back, Instructor</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 rounded-full bg-white border border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-900">{profile.username || 'Instructor'}</p>
                                <p className="text-xs text-gray-500">{profile.role === 'teacher' ? 'Instructor' : profile.role}</p>
                            </div>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username || 'default'}`} alt="Profile" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
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
                        {activeTab === 'my-courses' && <MyCoursesView />}
                        {activeTab === 'analytics' && <AnalyticsView />}
                        {activeTab === 'wallet' && <EarningsView />}
                        {activeTab === 'settings' && <SettingsView />}
                    </motion.div>
                </div>
            </main>
        </div>
    );
};

export default TeacherDashboard;
