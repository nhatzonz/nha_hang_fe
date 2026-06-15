import api from './api';

export const aiService = {
  // Món tương tự một món cho trước
  similar: (menuId, k = 5) => api.get(`/ai/similar/${menuId}`, { params: { k } }),
  // Gợi ý cá nhân hoá theo khách hàng
  recommend: (customerId, k = 5) =>
    api.get(`/ai/recommend/${customerId}`, { params: { k } }),
};
