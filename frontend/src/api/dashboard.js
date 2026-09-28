import api from './client';

export const getDashboardSummaryApi = async () => {
  const response = await api.get('/api/dashboard/summary');
  return response.data;
};

export const getDashboardActivityApi = async () => {
  const response = await api.get('/api/dashboard/activity');
  return response.data;
};

export const getCriticalAssetsApi = async () => {
  const response = await api.get('/api/dashboard/critical-assets');
  return response.data;
};
