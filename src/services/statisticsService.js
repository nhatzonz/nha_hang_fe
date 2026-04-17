import api from './api';

export const statisticsService = {
  overview: (params = {}) => api.get('/statistics/overview', { params }),
  revenue: (params = {}) => api.get('/statistics/revenue', { params }),
  topItems: (params = {}) => api.get('/statistics/top-items', { params }),
  ordersByStatus: () => api.get('/statistics/orders-by-status'),
  retention: () => api.get('/statistics/retention'),
  revenueByCategory: (params = {}) => api.get('/statistics/revenue-by-category', { params }),
};
