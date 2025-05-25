import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
    crossDomain: true
});

// Add request interceptor to handle CORS
api.interceptors.request.use(
    (config) => {
        const token = JSON.parse(localStorage.getItem('userInfo'))?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('userInfo');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default api; 