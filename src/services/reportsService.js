import api from './api';

export const reportsService = {
  revenueByHour: (date) => api.get('/reports/revenue-by-hour', { params: date ? { date } : {} }),
  revenueByWeekday: (params = {}) => api.get('/reports/revenue-by-weekday', { params }),
  revenueByStaff: (params = {}) => api.get('/reports/revenue-by-staff', { params }),
  menuPerformance: (params = {}) => api.get('/reports/menu-performance', { params }),
  topCustomers: (params = {}) => api.get('/reports/top-customers', { params }),
  customerSegmentation: (params = {}) => api.get('/reports/customer-segmentation', { params }),
  cancellationAnalysis: (params = {}) => api.get('/reports/cancellation-analysis', { params }),
};
