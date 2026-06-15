import api from './api';

export const aiService = {
  similar: (menuId, k = 5) => api.get(`/ai/similar/${menuId}`, { params: { k } }),
  recommend: (customerId, k = 5) =>
    api.get(`/ai/recommend/${customerId}`, { params: { k } }),
};
