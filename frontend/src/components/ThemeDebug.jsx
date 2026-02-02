import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Theme Debug Component
 * Shows current theme state and helps debug theme issues
 */
const ThemeDebug = () => {
    const { theme } = useTheme();
    const isDarkClass = document.documentElement.classList.contains('dark');

    return (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-xs font-mono">
            <div>Theme State: {theme}</div>
            <div>Dark Class: {isDarkClass ? 'YES' : 'NO'}</div>
            <div>HTML Classes: {document.documentElement.className || 'none'}</div>
        </div>
    );
};

export default ThemeDebug;
