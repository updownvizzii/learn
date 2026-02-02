import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Lock, UserPlus, Github, ShieldCheck } from 'lucide-react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            setError('PROTOCOL FAILURE: UNABLE TO INITIALIZE SYNC.');
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
                <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md w-full space-y-10 bg-brand-surface p-12 rounded-[2.5rem] border border-brand-border shadow-premium relative z-10 glimmer transition-all"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-brand-primary/10 border border-brand-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-premium">
                        <ShieldCheck className="w-8 h-8 text-brand-primary" />
                    </div>
                    <h2 className="text-3xl font-black text-brand-text italic tracking-tighter uppercase underline decoration-brand-primary decoration-4 underline-offset-8 mb-4 transition-colors">
                        INITIALIZE SYNC
                    </h2>
                    <p className="text-[10px] font-black tracking-[0.4em] text-brand-muted uppercase transition-colors">
                        Recruiting new operators
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
                                <User className="h-5 w-5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                            </div>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-12 pr-4 py-4 text-brand-text placeholder-brand-muted/40 outline-none focus:border-brand-primary/50 transition-all font-bold text-sm"
                                placeholder="OPERATOR HANDLE (NAME)"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
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
                                placeholder="SECURE LINK (EMAIL)"
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

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full flex justify-center items-center py-4 px-4 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-brand-primary/90 transition-all shadow-premium dark:shadow-premium-dark relative overflow-hidden group"
                    >
                        <UserPlus className="w-4 h-4 mr-3 group-hover:translate-x-1 transition-transform" />
                        Confirm Enrollment
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
                        ALREADY SYNCED?{' '}
                        <Link to="/login" className="text-brand-primary hover:text-brand-secondary underline decoration-2 underline-offset-4 decoration-brand-primary/30 transition-all">
                            ACCESS COMMAND
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
