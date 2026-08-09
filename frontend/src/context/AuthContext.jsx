import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            loadUser();
        } else {
            setLoading(false);
        }
    }, [token]);

    const loadUser = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.user);
        } catch (error) {
            console.error('Error loading user:', error);
            localStorage.removeItem('token');
            setToken(null);
            delete api.defaults.headers.common['Authorization'];
            // Don't show toast error on initial load - user might just not be logged in
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('=== Frontend Login Debug ===');
            console.log('Email:', email);
            console.log('Password provided:', password ? 'Yes' : 'No');
            
            const response = await api.post('/auth/login', { email, password });
            
            console.log('Login response:', response.data);
            
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            toast.success('Login successful!');
            return { success: true, user };
        } catch (error) {
            let message = 'Login failed. Please try again.';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.response?.data?.errors?.length) {
                message = error.response.data.errors.map(e => e.msg).join(', ');
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
                message = 'Backend server is not running or unreachable. Please start the server.';
            }
            toast.error(message);
            return { success: false, message };
        }
    };

    const register = async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            setToken(token);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            setUser(user);
            toast.success('Registration successful!');
            return { success: true, user };
        } catch (error) {
            let message = 'Registration failed. Please try again.';
            if (error.response?.data?.message) {
                message = error.response.data.message;
            } else if (error.response?.data?.errors?.length) {
                message = error.response.data.errors.map(e => e.msg).join(', ');
            } else if (error.code === 'ERR_NETWORK' || !error.response) {
                message = 'Backend server is not running or unreachable. Please start the server.';
            }
            toast.error(message);
            return { success: false, message };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        toast.info('Logged out successfully');
    };

    const updateProfile = async (data) => {
        try {
            const response = await api.put('/auth/updateprofile', data);
            setUser(response.data.user);
            toast.success('Profile updated successfully!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update profile.';
            toast.error(message);
            return { success: false, message };
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        reloadUser: loadUser,
        isAuthenticated: !!user,
        isJobSeeker: user?.role === 'jobseeker',
        isEmployer: user?.role === 'employer',
        isAdmin: user?.role === 'admin'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};