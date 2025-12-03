import axios from 'axios';

// Determine API base URL with better production detection
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (isProduction
    ? 'https://crimsonbricks.com/api'  // Production fallback
    : 'http://localhost:3001/api'  // Development fallback
  );

// Log the API configuration for debugging
console.log('🔗 API Configuration:', {
  hostname: window.location.hostname,
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  isProductionDetected: isProduction,
  envVar: import.meta.env.VITE_API_BASE_URL,
  finalURL: API_BASE_URL,
  allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_'))
});

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for mobile uploads
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Handle FormData uploads (remove Content-Type to let browser set it)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      console.log('🔄 FormData upload detected - removing Content-Type header');
    }

    console.log('📡 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      isFormData: config.data instanceof FormData,
      timeout: config.timeout
    });

    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config.url,
      method: response.config.method?.toUpperCase(),
      size: response.data ? JSON.stringify(response.data).length : 0
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.message,
      data: error.response?.data,
      timeout: error.code === 'ECONNABORTED' ? 'Request timeout' : false
    });

    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;