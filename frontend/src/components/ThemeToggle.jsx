import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <motion.button
            onClick={toggleTheme}
            className={`relative w-16 h-8 rounded-full transition-colors duration-300 ${theme === 'dark'
                    ? 'bg-blue-600'
                    : 'bg-amber-400'
                } ${className}`}
            whileTap={{ scale: 0.95 }}
        >
            {/* Toggle Circle */}
            <motion.div
                className={`absolute top-1 w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${theme === 'dark'
                        ? 'bg-slate-800'
                        : 'bg-white'
                    }`}
                animate={{
                    x: theme === 'dark' ? 2 : 38
                }}
                transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 30
                }}
            >
                {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-blue-400" />
                ) : (
                    <Sun className="w-4 h-4 text-amber-500" />
                )}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
