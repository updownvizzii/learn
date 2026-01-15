import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, Award, Users, CheckCircle } from 'lucide-react';

const Landing = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                                EduPlatform
                            </span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <span className="text-gray-600 hover:text-indigo-600 font-medium transition cursor-pointer">Features</span>
                            <Link to="/courses" className="text-gray-600 hover:text-indigo-600 font-medium transition">Courses</Link>
                            <span className="text-gray-600 hover:text-indigo-600 font-medium transition cursor-pointer">Testimonials</span>
                            <Link to="/login" className="text-gray-900 font-medium hover:text-indigo-600 transition">Log in</Link>
                            <Link to="/register" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
                                Sign Up Free
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32">
                <div className="absolute inset-0 z-0">
                    <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50" />
                    <div className="absolute top-20 -left-20 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <span className="inline-block py-1 px-3 rounded-full bg-indigo-50 text-indigo-600 text-sm font-semibold mb-6 border border-indigo-100">
                                🚀 New: Interactive Coding Environments
                            </span>
                            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
                                Master any skill with <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Expert-Led Courses</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
                                Access 5000+ premium courses, live workshops, and a community of millions.
                                Start your learning journey today and unlock your potential.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link to="/student/dashboard" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-full font-semibold text-lg shadow-xl hover:bg-indigo-700 transition flex items-center justify-center">
                                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link to="/courses" className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-full font-semibold text-lg hover:bg-gray-50 transition flex items-center justify-center">
                                    Browse Courses
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Mock Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mt-20 rounded-2xl border border-gray-200 shadow-2xl bg-white p-2 md:p-4"
                    >
                        <div className="rounded-xl overflow-hidden bg-gray-50 aspect-video md:aspect-[21/9] relative grid place-items-center">
                            <div className="absolute inset-0 bg-gradient-to-tr from-gray-100 to-gray-50 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <span className="text-lg font-medium">Interactive Course Preview UI</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-gray-50" id="features">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose EduPlatform?</h2>
                        <p className="text-lg text-gray-600">Everything you need to succeed in your career</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { icon: BookOpen, title: 'Expert Content', desc: 'Learn from industry leaders and top university professors.' },
                            { icon: Users, title: 'Community', desc: 'Join a global community of learners and share your progress.' },
                            { icon: Award, title: 'Certificates', desc: 'Earn recognized certificates to boost your LinkedIn profile.' }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                            >
                                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                                    <feature.icon className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                EduPlatform
                            </span>
                            <p className="mt-4 text-gray-400 text-sm">
                                Empowering learners worldwide with accessible, high-quality education.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Browse Courses</a></li>
                                <li><a href="#" className="hover:text-white transition">Mentorship</a></li>
                                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Terms of use</a></li>
                                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
                        &copy; 2026 EduPlatform. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
