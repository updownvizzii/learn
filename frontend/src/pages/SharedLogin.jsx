import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import { Key, Mail, Lock, User, GraduationCap, School } from 'lucide-react';
import { useGamification } from '../components/GamificationProvider';

const SharedLogin = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('student'); // 'student' or 'teacher'
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        code: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login, register } = useAuth();
    const { handleGamificationResult } = useGamification();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let userData;
            if (isLogin) {
                userData = await login(formData.email, formData.password, role);
            } else {
                userData = await register(formData.username, formData.email, formData.password, role, formData.code);
            }

            // Handle Gamification Result on Login
            if (userData && userData.gamification) {
                const { streakResult, xpResult } = userData.gamification;
                if (xpResult) handleGamificationResult(xpResult);
                // streakResult can also be handled if needed
            }

            navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to authenticate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title={role === 'teacher' ? "Teacher's Portal" : "Student Learning Hub"}
            subtitle={isLogin ? "Welcome back! Please sign in to continue." : "Create an account to get started."}
        >
            {/* Role Toggle */}
            <div className="flex justify-center mb-10 bg-brand-bg p-1.5 rounded-2xl border border-brand-border shadow-inner">
                <button
                    onClick={() => setRole('student')}
                    className={`flex-1 flex items-center justify-center py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${role === 'student'
                        ? 'bg-brand-primary text-white shadow-premium scale-[1.02]'
                        : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/5'
                        }`}
                >
                    <GraduationCap className={`w-4 h-4 mr-2 ${role === 'student' ? 'text-white' : 'text-brand-muted'}`} />
                    Student
                </button>
                <button
                    onClick={() => {
                        setRole('teacher');
                        setIsLogin(true); // Teachers cannot sign up here
                    }}
                    className={`flex-1 flex items-center justify-center py-3 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${role === 'teacher'
                        ? 'bg-brand-primary text-white shadow-premium scale-[1.02]'
                        : 'text-brand-muted hover:text-brand-text hover:bg-brand-primary/5'
                        }`}
                >
                    <School className={`w-4 h-4 mr-2 ${role === 'teacher' ? 'text-white' : 'text-brand-muted'}`} />
                    Teacher
                </button>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6 bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                    >
                        <p>{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
                <AnimatePresence mode='popLayout'>
                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mb-4"
                        >
                            <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 transition-colors">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    required={!isLogin}
                                    className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-brand-text placeholder-brand-muted/40 outline-none focus:border-brand-primary/50 transition-all font-bold text-sm"
                                    placeholder="John Doe"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Email */}
                <div className="mb-4">
                    <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 transition-colors">Email Address</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                        </div>
                        <input
                            type="email"
                            name="email"
                            required
                            className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-brand-text placeholder-brand-muted/40 outline-none focus:border-brand-primary/50 transition-all font-bold text-sm"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Password */}
                <div className="mb-6">
                    <label className="block text-[10px] font-black text-brand-muted uppercase tracking-widest mb-2 transition-colors">Password</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                        </div>
                        <input
                            type="password"
                            name="password"
                            required
                            className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-brand-text placeholder-brand-muted/40 outline-none focus:border-brand-primary/50 transition-all font-bold text-sm"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Teacher Code Removed as per request */}

                <div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-4 px-6 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-primary/90 transition-all shadow-premium relative overflow-hidden group disabled:opacity-50"
                    >
                        {loading ? 'SYNCING...' : (isLogin ? 'Initiate Uplink' : 'Initialize Sync')}
                    </motion.button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-brand-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-brand-card text-brand-text/70">
                            Or continue with
                        </span>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-4">
                    <motion.button
                        whileHover={{ y: -2 }}
                        type="button"
                        className="w-full flex justify-center items-center py-4 px-6 border border-brand-border rounded-2xl bg-brand-bg text-[10px] font-black uppercase tracking-widest text-brand-text hover:bg-brand-surface transition-all group"
                    >
                        <svg className="w-5 h-5 mr-3" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        Google Sync
                    </motion.button>
                </div>
            </div>

            <div className="mt-8 text-center transition-colors">
                <p className="text-[10px] font-black text-brand-muted uppercase tracking-widest">
                    {role === 'student' ? (
                        <>
                            {isLogin ? "NO PROTOCOL SYNC? " : "ALREADY SYNCED? "}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-brand-primary hover:text-brand-secondary underline decoration-2 underline-offset-4 decoration-brand-primary/30 transition-all ml-2"
                            >
                                {isLogin ? 'INITIALIZE ACCOUNT' : 'ACCESS COMMAND'}
                            </button>
                        </>
                    ) : (
                        <span className="text-brand-muted/60 italic">
                            TEACHER NODES REQUIRE OVERSEER CLEARANCE.
                        </span>
                    )}
                </p>
            </div>
        </AuthLayout>
    );
};

export default SharedLogin;
