import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/layouts/AuthLayout';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLogin = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.email, formData.password, 'admin');
            navigate('/admin/dashboard');
        } catch (err) {
            setError('CLEARANCE DENIED: INVALID OVERSEER SYNC.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 sm:px-6 lg:px-8 font-jakarta relative overflow-hidden transition-colors">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-primary/10 rounded-full blur-[150px]" />
                <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md w-full space-y-10 bg-brand-surface p-12 rounded-[3.rem] border border-brand-border shadow-premium relative z-10 glimmer transition-all"
            >
                <div className="text-center">
                    <div className="w-20 h-20 bg-brand-primary/10 border border-brand-primary/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-premium">
                        <ShieldCheck className="w-10 h-10 text-brand-primary" />
                    </div>
                    <h2 className="text-4xl font-black text-brand-text italic tracking-tighter uppercase underline decoration-brand-primary decoration-8 underline-offset-8 mb-5 transition-colors">
                        OVERSEER CORE
                    </h2>
                    <p className="text-[10px] font-black tracking-[0.5em] text-brand-muted uppercase transition-colors">
                        Restricted Imperial Access
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
                    <div className="space-y-5">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                            </div>
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-14 pr-4 py-4.5 text-brand-text placeholder-brand-muted/40 outline-none focus:border-brand-primary/50 transition-all font-bold text-sm"
                                placeholder="ADMIN_IDENTIFIER"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-brand-muted group-focus-within:text-brand-primary transition-colors" />
                            </div>
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-brand-bg border border-brand-border rounded-2xl pl-14 pr-4 py-4.5 text-brand-text placeholder-brand-muted/40 outline-none focus:border-brand-primary/50 transition-all font-bold text-sm"
                                placeholder="COMMAND_KEY"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-5 px-6 bg-brand-primary text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-brand-primary/90 transition-all shadow-premium relative overflow-hidden group disabled:opacity-50"
                    >
                        <ShieldCheck className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                        {loading ? 'SYNCING...' : 'AUTHORIZE UPLINK'}
                    </motion.button>
                </form>

                <div className="text-center pt-6 transition-colors">
                    <p className="text-[9px] font-black text-brand-muted uppercase tracking-[0.3em]">
                        SYSTEM MONITORING ACTIVE // ID_{Math.floor(Math.random() * 1000000)}
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
