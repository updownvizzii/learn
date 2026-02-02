import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Users, Award, Shield } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Landing = () => {
    return (
        <div className="min-h-screen bg-brand-bg font-jakarta selection:bg-purple-600 dark:selection:bg-blue-600 selection:text-white relative overflow-hidden transition-colors">
            {/* Sector Grid Background Effect */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-primary/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-[120px]" />
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-brand-surface/80 backdrop-blur-2xl border-b border-brand-border px-10 h-24 flex items-center justify-between shadow-sm dark:shadow-none transition-colors">
                <div className="flex items-center gap-12">
                    <span className="text-3xl font-black text-brand-text italic tracking-tighter uppercase group cursor-pointer transition-colors">
                        FORTIMARK<span className="text-brand-primary">.</span>
                    </span>
                    <div className="hidden lg:flex items-center gap-10">
                        {['Protocol', 'Sectors', 'Intelligence', 'Operators'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase() === 'protocol' ? 'sectors' : item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted hover:text-brand-primary transition-colors">
                                {item}
                            </a>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <Link to="/login" className="text-brand-muted hover:text-brand-text font-black text-[10px] uppercase tracking-widest transition-colors">
                        Access Key
                    </Link>
                    <Link to="/register" className="bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-primary/80 transition shadow-lg shadow-brand-primary/30 transform hover:-translate-y-0.5">
                        Initialize Sync
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 z-10">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="text-center max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="inline-flex items-center gap-3 py-2 px-6 rounded-full bg-brand-primary/5 text-brand-primary text-[10px] font-black uppercase tracking-[0.4em] mb-12 border border-brand-primary/20 shadow-premium transition-colors">
                                <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_10px_var(--color-primary)]" />
                                Imperial Status: Operational
                            </div>
                            <h1 className="text-6xl md:text-[10rem] font-black text-brand-text tracking-tighter mb-12 leading-[0.85] uppercase italic transition-colors">
                                ASCEND <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary">THE CORE</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-brand-muted mb-16 leading-relaxed max-w-3xl mx-auto font-bold uppercase tracking-tight">
                                Access elite tactical repositories, live strategic operations, and a global syndicate of master operators.
                                Secure your future in the new digital order.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                                <Link to="/register" className="w-full sm:w-auto px-12 py-6 bg-brand-primary text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-premium hover:bg-brand-primary/90 transition-all flex items-center justify-center group overflow-hidden relative">
                                    <span className="relative z-10 flex items-center">
                                        Launch Command <ArrowRight className="ml-4 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                                <Link to="/courses" className="w-full sm:w-auto px-12 py-6 bg-brand-surface text-brand-text border border-brand-border rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] hover:border-brand-primary/40 transition-all flex items-center justify-center shadow-premium">
                                    Scan Sectors
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="mt-40 relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-[4rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative rounded-[3.5rem] border border-brand-border shadow-premium dark:shadow-premium-dark bg-brand-surface p-4 md:p-8 overflow-hidden glimmer transition-all">
                            <div className="rounded-[2rem] overflow-hidden bg-brand-bg aspect-video md:aspect-[21/9] relative border border-brand-border">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_var(--color-primary-glow),_transparent_70%)]" />
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-muted">
                                    <div className="text-center group-hover:scale-105 transition-transform duration-1000">
                                        <div className="relative inline-block mb-10">
                                            <div className="absolute -inset-4 bg-brand-primary/20 rounded-full blur-2xl animate-pulse" />
                                            <Shield className="w-28 h-28 relative z-10 text-brand-primary" />
                                        </div>
                                        <p className="text-[12px] font-black uppercase tracking-[0.6em] text-brand-primary/60 mb-2">Imperial Command Interface</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted">System Monitoring v.2.4.0 // Offline Preview</p>
                                    </div>
                                </div>
                                {/* Corner Guards */}
                                <div className="absolute top-12 left-12 w-20 h-20 border-l-2 border-t-2 border-brand-primary/30" />
                                <div className="absolute bottom-12 right-12 w-20 h-20 border-r-2 border-b-2 border-brand-primary/30" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-48 bg-brand-bg relative z-10" id="sectors">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="text-center mb-32">
                        <h2 className="text-5xl md:text-7xl font-black text-brand-text mb-8 uppercase tracking-tighter italic transition-colors">ESTABLISH DOMINANCE</h2>
                        <p className="text-sm text-brand-muted font-black uppercase tracking-[0.4em] transition-colors">Protocol-driven success for the imperial elite</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: BookOpen, title: 'Tactical Intel', desc: 'Secure high-level intelligence from master operators across the global grid.' },
                            { icon: Users, title: 'Elite Network', desc: 'Sync with a global syndicate of high-performers and domain experts.' },
                            { icon: Award, title: 'Verified Status', desc: 'Seal your expertise with imperial credentials recognized by the core.' }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -20, scale: 1.02 }}
                                className="bg-brand-surface p-16 rounded-[3rem] shadow-premium border border-brand-border hover:border-brand-primary/40 transition-all group glimmer relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 blur-[50px] group-hover:bg-brand-primary/10 transition-all" />
                                <div className="w-20 h-20 bg-brand-primary/10 rounded-2xl flex items-center justify-center mb-12 border border-brand-primary/20 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-xl">
                                    <feature.icon className="w-10 h-10 text-brand-primary group-hover:text-white" />
                                </div>
                                <h3 className="text-3xl font-black text-brand-text mb-6 uppercase tracking-tight italic transition-colors">{feature.title}</h3>
                                <p className="text-brand-muted leading-relaxed font-bold text-lg tracking-tight uppercase transition-colors">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative z-10">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="bg-brand-surface rounded-[4rem] p-20 border border-brand-border text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary-glow),_transparent_70%)]" />
                        <h2 className="text-4xl md:text-6xl font-black text-brand-text mb-10 uppercase italic tracking-tighter relative z-10 transition-colors">READY TO INITIALIZE?</h2>
                        <Link to="/register" className="inline-flex items-center px-16 py-6 bg-brand-primary text-white rounded-3xl font-black text-sm uppercase tracking-[0.4em] shadow-premium hover:bg-brand-primary/90 transition-all relative z-10 transform hover:scale-105 active:scale-95">
                            Enter the Core
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-brand-bg text-brand-text py-40 border-t border-brand-border relative z-10">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
                        <div className="md:col-span-2">
                            <span className="text-4xl font-black text-brand-text italic tracking-tighter uppercase group cursor-pointer transition-colors">
                                FORTIMARK<span className="text-brand-primary">.</span>
                            </span>
                            <p className="mt-10 text-brand-muted text-xl font-bold uppercase tracking-tight max-w-sm leading-relaxed transition-colors">
                                Redefining the boundaries of learning through strategic operations and domain mastery.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-black text-[11px] uppercase tracking-[0.4em] mb-10 text-brand-primary transition-colors">Operation</h4>
                            <ul className="space-y-5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">
                                <li><Link to="/courses" className="hover:text-brand-text transition-colors">Access Sectors</Link></li>
                                <li><a href="#" className="hover:text-brand-text transition-colors">Elite Mentors</a></li>
                                <li><a href="#" className="hover:text-brand-text transition-colors">Capitalization</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-[11px] uppercase tracking-[0.4em] mb-10 text-brand-primary transition-colors">Syndicate</h4>
                            <ul className="space-y-5 text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">
                                <li><a href="#" className="hover:text-brand-text transition-colors">About Core</a></li>
                                <li><a href="#" className="hover:text-brand-text transition-colors">Recruit</a></li>
                                <li><a href="#" className="hover:text-brand-text transition-colors">Logs</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-40 pt-16 border-t border-brand-border flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted">
                        <span>&copy; 2026 FORTIMARK SYNDICATE. ALL RIGHTS SECURED.</span>
                        <div className="flex gap-12">
                            <a href="#" className="hover:text-brand-text transition-colors">Security Protocol</a>
                            <a href="#" className="hover:text-brand-text transition-colors">Privacy Seal</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
