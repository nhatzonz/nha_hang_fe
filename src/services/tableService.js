import api from './api';

export const tableService = {
  list: (params = {}) => api.get('/tables', { params }),
  getById: (id) => api.get(`/tables/${id}`),
  create: (data) => api.post('/tables', data),
  update: (id, data) => api.patch(`/tables/${id}`, data),
  updateStatus: (id, status) => api.patch(`/tables/${id}/status`, { status }),
  remove: (id) => api.delete(`/tables/${id}`),
};
