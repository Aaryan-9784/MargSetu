import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

if (!normalizedBaseUrl && import.meta.env.PROD) {
  console.warn(
    '⚠️ RoadSetu Configuration Alert: VITE_API_URL environment variable is not defined. API requests may fail. Please configure VITE_API_URL in your Vercel deployment settings.'
  );
}

const api = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('roadsetu_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('roadsetu_token');
      localStorage.removeItem('roadsetu_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
