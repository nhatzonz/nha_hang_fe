import api from './api';

export const chatbotService = {
  sendMessage: (message, sessionId) => api.post('/chatbot/message', { message, session_id: sessionId }),
  getHistory: (sessionId) => api.get('/chatbot/history', { params: { session_id: sessionId } }),
};
