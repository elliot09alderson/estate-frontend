import axios from 'axios';

// Centralized API configuration
const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com/api' 
    : 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth tokens
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Property Types
export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  category: 'flat' | 'farming-land' | 'house-shop' | 'plot';
  type: 'sale' | 'rent';
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  location: string;
  address: string;
  images: string[];
  agentId: string;
  agentName: string;
  agentPhone: string;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: 'user' | 'agent' | 'admin';
  isActive: boolean;
  favorites: string[];
  createdAt: string;
}

export interface Agent extends User {
  licenseNumber: string;
  companyName: string;
  properties: Property[];
}

// API Functions (These will need backend implementation)
export const propertyAPI = {
  getAll: (filters?: any) => api.get('/properties', { params: filters }),
  getById: (id: string) => api.get(`/properties/${id}`),
  create: (data: Partial<Property>) => api.post('/properties', data),
  update: (id: string, data: Partial<Property>) => api.put(`/properties/${id}`, data),
  delete: (id: string) => api.delete(`/properties/${id}`),
  uploadImages: (files: FormData) => api.post('/properties/upload', files, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const userAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  register: (data: { email: string; password: string; name: string; role?: string }) => 
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: Partial<User>) => api.put('/auth/profile', data),
  toggleFavorite: (propertyId: string) => api.post('/auth/favorites', { propertyId }),
  getFavorites: () => api.get('/auth/favorites'),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (userId: string) => api.put(`/admin/users/${userId}/toggle-status`),
  getAnalytics: () => api.get('/admin/analytics'),
  getProperties: () => api.get('/admin/properties'),
  togglePropertyStatus: (propertyId: string) => api.put(`/admin/properties/${propertyId}/toggle-status`),
};