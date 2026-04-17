import api from './api';

export const menuService = {
  list: (params = {}) => api.get('/menu', { params }),
  getById: (id) => api.get(`/menu/${id}`),
  create: (formData) => api.post('/menu', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, formData) => api.patch(`/menu/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  remove: (id) => api.delete(`/menu/${id}`),
};
