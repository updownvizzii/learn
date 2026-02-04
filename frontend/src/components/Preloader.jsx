import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Cpu, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Preloader = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [visitCount, setVisitCount] = useState(() => {
        const storedVisits = localStorage.getItem('tactical_visits');
        return storedVisits ? parseInt(storedVisits) : 0;
    });
    const [globalBranding, setGlobalBranding] = useState({ preloaderText: '', preloaderImage: '' });

    useEffect(() => {
        // Increment visit count only once per component mount
        const newCount = visitCount + 1;
        localStorage.setItem('tactical_visits', newCount.toString());
        setVisitCount(newCount);

        // Fetch global branding
        const fetchBranding = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/auth/branding');
                const data = await res.json();
                setGlobalBranding(data);
            } catch (error) {
                console.error('Error fetching branding:', error);
            }
        };
        fetchBranding();

        // Minimum display time for the premium experience
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    const isFirstTime = visitCount <= 2;
    const customText = user?.preloaderText || globalBranding.preloaderText;
    const customImage = user?.preloaderImage || globalBranding.preloaderImage;

    return (
        <AnimatePresence>
            {loading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{
                        opacity: 0,
                        transition: { duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }
                    }}
                    className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
                >
                    {/* Tactical Background Elements */}
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse" />
                        <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(var(--color-primary) 0.5px, transparent 0.5px)`, backgroundSize: '40px 40px' }} />
                    </div>

                    {/* Central Core */}
                    <div className="relative flex flex-col items-center gap-8">
                        {/* Animated Shield/Logo Ring */}
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 rounded-full border-t-2 border-b-2 border-brand-primary/30"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-2 rounded-full border-l-2 border-r-2 border-brand-secondary/20"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="relative"
                                >
                                    {customImage ? (
                                        <img src={customImage} alt="Brand" className="w-16 h-16 object-contain relative z-10" />
                                    ) : (
                                        <Shield className="w-12 h-12 text-brand-primary drop-shadow-[0_0_15px_var(--color-primary)]" />
                                    )}
                                    <motion.div
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute inset-0 blur-md bg-brand-primary/50 rounded-full"
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Welcome Message */}
                        <div className="text-center space-y-4 relative z-10">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <h1 className="text-brand-primary font-black text-5xl uppercase italic tracking-tighter sm:text-6xl drop-shadow-[0_0_20px_var(--color-primary)]">
                                    {isFirstTime ? 'WELCOME' : 'WELCOME BACK'}
                                </h1>
                                <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em] mt-3">
                                    Neural Uplink Stable
                                </p>
                                <div className="h-1 w-32 bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent mx-auto mt-4" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.8, delay: 1 }}
                                className="flex items-center justify-center gap-6"
                            >
                                <div className="flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-brand-muted" />
                                    <span className="text-brand-muted font-black text-[9px] uppercase tracking-[0.3em]">Neural Uplink</span>
                                </div>
                                <div className="h-3 w-[1px] bg-brand-border" />
                                <div className="flex items-center gap-2">
                                    <Cpu className="w-3 h-3 text-brand-muted" />
                                    <span className="text-brand-muted font-black text-[9px] uppercase tracking-[0.3em]">Grid Status: Stable</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    {/* Progress Bar Loader */}
                    <div className="absolute bottom-20 w-64 h-1 bg-brand-bg rounded-full overflow-hidden border border-brand-border/30">
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-brand-primary to-transparent"
                        />
                    </div>

                    {/* Scanning Line */}
                    <motion.div
                        animate={{ top: ['0%', '100%', '0%'] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-px bg-brand-primary/10 shadow-[0_0_15px_var(--color-primary)] z-20 pointer-events-none"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Preloader;
