import api from './client';

export const loginApi = async (credentials) => {
  const response = await api.post('/api/auth/login', credentials);
  return response.data;
};

export const getMeApi = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};
