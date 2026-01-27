import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  saveProfile: (data) => api.post('/auth/profile', data),
  getProfile: () => api.get('/auth/profile'),
  analyzeResume: (formData) => {
    return api.post('/resume/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  generateAtsResume: (data) => {
    return api.post('/resume/generate-ats-resume', data);
  },
};

export default api;

