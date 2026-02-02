import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Configure axios defaults
    axios.defaults.withCredentials = true; // For cookies
    const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const login = async (email, password, role = null, code = '') => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/auth/login`, { email, password });
            const userData = res.data;

            // Role Check (Only if a specific role is enforced)
            if (role && userData.role !== role && role !== 'admin') {
                if (userData.role !== role) {
                    throw new Error(`Invalid role. This account is for ${userData.role}s.`);
                }
            }

            setUser(userData);
            localStorage.setItem('accessToken', userData.accessToken);
            return userData;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Login failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const register = async (username, email, password, role = 'student', code = '') => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/auth/register`, {
                username,
                email,
                password,
                role,
                code
            });
            const userData = res.data;
            setUser(userData);
            localStorage.setItem('accessToken', userData.accessToken);
            return userData;
        } catch (err) {
            const message = err.response?.data?.message || err.message || 'Registration failed';
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`);
        } catch (e) {
            console.error(e);
        }
        setUser(null);
        localStorage.removeItem('accessToken');
    };

    const checkUserLoggedIn = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                setLoading(false);
                return;
            }

            const res = await axios.get(`${API_URL}/auth/profile`);
            setUser(res.data);
        } catch (err) {
            // Silently handle expired or invalid tokens on app load/refresh
            if (err.response?.status === 401) {
                localStorage.removeItem('accessToken');
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshAccessToken = async () => {
        try {
            const res = await axios.post(`${API_URL}/auth/refresh`);
            return res.data.accessToken;
        } catch (err) {
            throw err;
        }
    };

    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('accessToken');
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const responseInterceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response?.status === 403 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const newToken = await refreshAccessToken();
                        localStorage.setItem('accessToken', newToken);
                        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                        return axios(originalRequest);
                    } catch (refreshError) {
                        setUser(null);
                        localStorage.removeItem('accessToken');
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        }
    }, []);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
