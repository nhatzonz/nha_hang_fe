import api from './api';

export const reservationService = {
  list: (params = {}) => api.get('/reservations', { params }),
  getById: (id) => api.get(`/reservations/${id}`),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.patch(`/reservations/${id}`, data),
  changeStatus: (id, status) => api.patch(`/reservations/${id}/status`, { status }),
  remove: (id) => api.delete(`/reservations/${id}`),
  lookupCustomer: (phone) => api.get(`/reservations/customer-by-phone/${phone}`),
};

export const RESERVATION_STATUS_LABELS = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã huỷ',
  completed: 'Đã đến',
};
