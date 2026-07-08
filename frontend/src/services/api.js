import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Important for cookies/sessions
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 [${config.method.toUpperCase()}] ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`📥 [${response.config.method.toUpperCase()}] ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.error(`❌ Response error: ${error.config?.url} - ${error.response?.status}`, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;