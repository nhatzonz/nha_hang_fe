import api from './api';

export const orderService = {
  list: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.patch(`/orders/${id}`, data),
  changeStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  remove: (id) => api.delete(`/orders/${id}`),

  // Items management
  addItems: (orderId, items) => api.post(`/orders/${orderId}/items`, { items }),
  updateItem: (orderId, detailId, data) => api.patch(`/orders/${orderId}/items/${detailId}`, data),
  removeItem: (orderId, detailId) => api.delete(`/orders/${orderId}/items/${detailId}`),
};

export const ORDER_STATUS_LABELS = {
  pending: 'Chờ xử lý',
  preparing: 'Đang chế biến',
  served: 'Đã phục vụ',
  completed: 'Hoàn thành',
  cancelled: 'Đã huỷ',
};

export const ORDER_STATUS_FLOW = {
  pending: 'preparing',
  preparing: 'served',
  served: 'completed',
};

export const NEXT_STATUS_LABELS = {
  pending: 'Bắt đầu chế biến',
  preparing: 'Đánh dấu đã phục vụ',
  served: 'Hoàn thành & thanh toán',
};
