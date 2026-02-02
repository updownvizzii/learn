import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, Github, Shield } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    // Redirect based on role
    useEffect(() => {
        if (user) {
            if (user.role === 'admin') {
                logout();
                setError('ADMIN NODES REQUIRE OVERSEER CLEARANCE. REDIRECTING...');
                setTimeout(() => navigate('/admin/login'), 2000);
            } else if (user.role === 'teacher') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        }
    }, [user, navigate, logout]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate(from, { replace: true });
        } catch (err) {
            setError('ACCESS DENIED: INVALID CREDENTIALS SYNC.');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/google';
    };

    const handleGithubLogin = () => {
        window.location.href = 'http://localhost:5000/api/auth/github';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 sm:px-6 lg:px-8 font-jakarta relative overflow-hidden transition-colors">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px]" />
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md w-full space-y-10 bg-brand-surface p-12 rounded-[2.5rem] border border-brand-border shadow-premium relative z-10 glimmer transition-all"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-premium">
                        <Shield className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-brand-text italic tracking-tighter uppercase underline decoration-brand-primary decoration-4 underline-offset-8 mb-4 transition-colors">
                        IDENTIFY PROTOCOL
                    </h2>
                    <p className="text-[10px] font-black tracking-[0.4em] text-brand-muted uppercase transition-colors">
                        Establishing secure downlink
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                            </div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                required
                                className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-brand-text placeholder-brand-muted/40 outline-none focus:border-brand-primary/50 transition-all font-bold text-sm"
                                placeholder="SYNC ID (EMAIL)"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-brand-text placeholder-brand-muted/40 outline-none focus:border-brand-primary/50 transition-all font-bold text-sm"
                                placeholder="ACCESS KEY (PASSWORD)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                className="h-4 w-4 bg-brand-bg border-brand-border rounded text-brand-primary focus:ring-brand-primary focus:ring-offset-brand-bg transition-all"
                            />
                            <label htmlFor="remember-me" className="ml-3 block text-[10px] font-black text-brand-muted uppercase tracking-widest transition-colors">
                                PERSIST SESSION
                            </label>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest transition-colors">
                            <a href="#" className="text-brand-primary hover:text-brand-secondary transition-colors">
                                RECOVER KEY
                            </a>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full flex justify-center items-center py-4 px-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-primary/90 transition-all shadow-premium dark:shadow-premium-dark relative overflow-hidden group"
                    >
                        <LogIn className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                        Initiate Uplink
                    </motion.button>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-brand-border" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-4 bg-brand-surface text-[9px] font-black text-brand-muted uppercase tracking-widest">
                            ALT CHANNELS
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <motion.button
                        whileHover={{ y: -2 }}
                        onClick={handleGoogleLogin}
                        className="flex justify-center items-center py-3 border border-brand-border rounded-2xl bg-brand-bg hover:bg-brand-surface transition-all group"
                    >
                        <svg className="h-5 w-5 text-brand-text" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                        </svg>
                    </motion.button>
                    <motion.button
                        whileHover={{ y: -2 }}
                        onClick={handleGithubLogin}
                        className="flex justify-center items-center py-3 border border-brand-border rounded-2xl bg-brand-bg hover:bg-brand-surface transition-all group"
                    >
                        <Github className="h-5 w-5 text-brand-text" />
                    </motion.button>
                </div>

                <div className="text-center pt-4 transition-colors">
                    <p className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em]">
                        NO PROTOCOL SYNC?{' '}
                        <Link to="/register" className="text-brand-primary hover:text-brand-secondary underline decoration-2 underline-offset-4 decoration-brand-primary/30 transition-all">
                            INITIALIZE ACCOUNT
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
