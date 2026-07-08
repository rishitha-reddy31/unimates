import api from './api';

export const eventService = {
  createEvent: (data) => api.post('/events/create', data),
  
  getEvents: (category, upcoming = true) => 
    api.get('/events', { params: { category, upcoming } }),
  
  getEvent: (eventId) => api.get(`/events/${eventId}`),
  
  attendEvent: (eventId) => api.post(`/events/${eventId}/attend`),
  
  updateEvent: (eventId, data) => api.put(`/events/${eventId}`, data),
  
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`)
};