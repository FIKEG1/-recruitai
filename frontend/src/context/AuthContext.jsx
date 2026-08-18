import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
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
    const [organization, setOrganization] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    // Only a stored token means there is a session to restore. Starting at
    // `false` for anonymous visitors stops the route guard from flashing a
    // spinner before it redirects to the login page.
    const [loading, setLoading] = useState(() => !!localStorage.getItem('token'));

    // The token whose profile is already in state. Signing in or registering
    // fills user/organization straight from the auth response, so this stops the
    // effect below from firing a second /auth/me request and swapping the user
    // object again - that swap was what dropped every dashboard back into its
    // own loading state right after a successful login.
    const hydratedToken = useRef(null);

    useEffect(() => {
        if (!token) {
            hydratedToken.current = null;
            delete api.defaults.headers.common['Authorization'];
            setLoading(false);
            return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        if (hydratedToken.current === token) return;

        setLoading(true);
        loadUser(token);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    const loadUser = async (activeToken) => {
        try {
            const response = await api.get('/auth/me');
            hydratedToken.current = activeToken || localStorage.getItem('token');
            setUser(response.data.user);
            setOrganization(response.data.organization || null);
        } catch (error) {
            console.error('Error loading user:', error);
            hydratedToken.current = null;
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setOrganization(null);
            delete api.defaults.headers.common['Authorization'];
            // Don't show toast error on initial load - user might just not be logged in
        } finally {
            setLoading(false);
        }
    };

    /** Adopt a session from a login/register response, with no extra round trip. */
    const applySession = (newToken, authUser, org) => {
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        hydratedToken.current = newToken;
        setUser(authUser);
        setOrganization(org || null);
        setLoading(false);
        setToken(newToken);
    };

    const login = async (email, password) => {
        try {
            console.log('=== Frontend Login Debug ===');
            console.log('Email:', email);
            console.log('Password provided:', password ? 'Yes' : 'No');
            
            const response = await api.post('/auth/login', { email, password });
            
            console.log('Login response:', response.data);
            
            const { token, user } = response.data;
            applySession(token, user, response.data.organization);
            // No success toast: the redirect to the role's dashboard already
            // confirms the sign-in.
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
            applySession(token, user, response.data.organization);
            // No success toast: the redirect to the new account's dashboard
            // already confirms the sign-up.
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
        hydratedToken.current = null;
        setLoading(false);
        setUser(null);
        setOrganization(null);
        setToken(null);
        delete api.defaults.headers.common['Authorization'];
        // No toast: returning to the public/login view already confirms sign-out.
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
        organization,
        loading,
        login,
        register,
        logout,
        updateProfile,
        reloadUser: loadUser,
        isAuthenticated: !!user,
        isCandidate: user?.role === 'candidate',
        isHRExpert: user?.role === 'hr_expert',
        isHRManager: user?.role === 'hr_manager',
        isEmployer: user?.role === 'employer',
        isAdmin: user?.role === 'admin',
        // Capability check mirroring the backend permission matrix.
        can: (capability) => (user?.capabilities || []).includes(capability)
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};