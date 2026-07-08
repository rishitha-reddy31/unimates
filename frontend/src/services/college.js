import api from './api';

export const collegeService = {
  getColleges: () => api.get('/colleges'),
  getCollegeByDomain: (domain) => api.get(`/colleges/domain/${domain}`),
  registerCollege: (collegeData) => api.post('/colleges/register', collegeData)
};