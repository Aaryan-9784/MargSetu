import api from './client';

export const getAssetLifecycleApi = async (assetId) => {
  const response = await api.get(`/api/assets/${assetId}/lifecycle`);
  return response.data;
};

export const getAllLifecycleEventsApi = async (params = {}) => {
  const response = await api.get('/api/lifecycle', { params });
  return response.data;
};
