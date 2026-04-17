import api from './api';

export const bankAccountService = {
  list: () => api.get('/bank-accounts'),
  getActive: () => api.get('/bank-accounts/active'),
  getById: (id) => api.get(`/bank-accounts/${id}`),
  create: (data) => api.post('/bank-accounts', data),
  update: (id, data) => api.patch(`/bank-accounts/${id}`, data),
  activate: (id) => api.patch(`/bank-accounts/${id}/activate`),
  deactivate: (id) => api.patch(`/bank-accounts/${id}/deactivate`),
  remove: (id) => api.delete(`/bank-accounts/${id}`),
};
