import api from './api';

export const restaurantService = {
  getInfo: () => api.get('/restaurant/info'),
  update: (data) => api.patch('/restaurant/info', data),
};
