import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const apiBaseURL = rawBase.replace(/\/+$/, '').endsWith('/api')
    ? rawBase.replace(/\/+$/, '')
    : `${rawBase.replace(/\/+$/, '')}/api`;

const api = axios.create({
    baseURL: apiBaseURL,
    timeout: 15000, // 15 seconds max - prevent infinite loading
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auto-logout on 401 Unauthorized
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;