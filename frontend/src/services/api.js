import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const BASE_URL = API_URL.replace(/\/api\/?$/, '');

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        if (config.data instanceof FormData) {
            // Let the browser set the correct multipart/form-data boundary
            delete config.headers['Content-Type'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            // Don't redirect automatically - let ProtectedRoute handle redirects
            // This allows the home page to load by default
        }
        return Promise.reject(error);
    }
);

export const getImageUrl = (path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    const cleanPath = path.replace(/^\/+/, '');
    // The backend saves path as 'uploads/profiles/filename.jpg'
    // We need to access it via BASE_URL/uploads/profiles/filename.jpg
    const url = `${BASE_URL}/${cleanPath}`;
    console.log('getImageUrl - Path:', path, 'Clean:', cleanPath, 'URL:', url);
    return url;
};

export default api;
