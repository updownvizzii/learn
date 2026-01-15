import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthSuccess = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        // If user is loaded (AuthContext handles token from URL), redirect
        if (user) {
            navigate('/student/dashboard');
        } else {
            // Fallback if context didn't catch it yet or failed
            const token = new URLSearchParams(window.location.search).get('token');
            if (token) {
                // Context checkUser logic should have handled this, but just in case
                localStorage.setItem('accessToken', token);
                navigate('/student/dashboard'); // Helper will reload/check
                window.location.reload();
            } else {
                navigate('/login');
            }
        }
    }, [user, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
};

export default AuthSuccess;
