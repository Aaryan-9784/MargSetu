import api from './client';

export const getAssetInspectionsApi = async (assetId) => {
  const response = await api.get(`/api/assets/${assetId}/inspections`);
  return response.data;
};

export const createInspectionApi = async (assetId, inspectionData) => {
  const response = await api.post(`/api/assets/${assetId}/inspections`, inspectionData);
  return response.data;
};
