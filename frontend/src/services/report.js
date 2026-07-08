import api from './api';

export const reportService = {
  createReport: (data) => api.post('/reports/create', data),
  
  getReports: (status, page = 1) => 
    api.get('/reports', { params: { status, page } }),
  
  resolveReport: (reportId, action) => 
    api.put(`/reports/${reportId}/resolve`, { action }),
  
  dismissReport: (reportId) => api.put(`/reports/${reportId}/dismiss`)
};