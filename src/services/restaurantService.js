import api from './api';

export const restaurantService = {
  getInfo: () => api.get('/restaurant/info'),
};
