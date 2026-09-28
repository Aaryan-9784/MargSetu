import api from './client';

export const getAllMaintenanceApi = async (params = {}) => {
  const response = await api.get('/api/maintenance', { params });
  return response.data;
};

export const getAssetMaintenanceApi = async (assetId) => {
  const response = await api.get(`/api/assets/${assetId}/maintenance`);
  return response.data;
};

export const createMaintenanceApi = async (assetId, ticketData) => {
  const response = await api.post(`/api/assets/${assetId}/maintenance`, ticketData);
  return response.data;
};

export const updateMaintenanceApi = async (ticketId, updateData) => {
  const response = await api.put(`/api/maintenance/${ticketId}`, updateData);
  return response.data;
};
