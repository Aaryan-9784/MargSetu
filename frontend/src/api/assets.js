import api from './client';

export const getAssetsApi = async (params = {}) => {
  const response = await api.get('/api/assets', { params });
  return response.data;
};

export const getAssetByIdApi = async (id) => {
  const response = await api.get(`/api/assets/${id}`);
  return response.data;
};

export const createAssetApi = async (assetData) => {
  const response = await api.post('/api/assets', assetData);
  return response.data;
};

export const updateAssetApi = async (id, assetData) => {
  const response = await api.put(`/api/assets/${id}`, assetData);
  return response.data;
};

export const deleteAssetApi = async (id) => {
  const response = await api.delete(`/api/assets/${id}`);
  return response.data;
};
