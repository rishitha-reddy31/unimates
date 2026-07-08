// frontend/src/services/group.js
import api from './api'; 

export const groupService = { 
  createGroup: (data) => {
    console.log('📤 Creating group with data:', data);
    return api.post('/groups/create', data);
  },
  
  getGroups: (category, search) => {
    console.log('📤 Fetching groups with params:', { category, search });
    return api.get('/groups', { params: { category, search } });
  },
  
  getGroup: (groupId) => {
    console.log('📤 Fetching group:', groupId);
    return api.get(`/groups/${groupId}`);
  },
  
  joinGroup: (groupId) => {
    console.log('📤 Joining group:', groupId);
    return api.post(`/groups/${groupId}/join`);
  },
  
  leaveGroup: (groupId) => {
    console.log('📤 Leaving group:', groupId);
    return api.post(`/groups/${groupId}/leave`);
  },
  
  updateGroup: (groupId, data) => {
    console.log('📤 Updating group:', groupId, data);
    return api.put(`/groups/${groupId}`, data);
  },
  
  deleteGroup: (groupId) => {
    console.log('📤 Deleting group:', groupId);
    return api.delete(`/groups/${groupId}`);
  },
  
  addResource: (groupId, file, title, description) => { 
    const formData = new FormData(); 
    formData.append('file', file); 
    formData.append('title', title); 
    formData.append('description', description); 
    return api.post(`/groups/${groupId}/resources`, formData, { 
      headers: { 'Content-Type': 'multipart/form-data' } 
    }); 
  },
  
  removeMember: (groupId, userId) => {
    console.log('📤 Removing member:', userId, 'from group:', groupId);
    return api.delete(`/groups/${groupId}/members/${userId}`);
  },
  
  updateMemberRole: (groupId, userId, role) => {
    console.log('📤 Updating member role:', userId, 'to', role, 'in group:', groupId);
    return api.put(`/groups/${groupId}/members/${userId}`, { role });
  },
  
  makeAdmin: (groupId, userId) => {
    console.log('📤 Making admin:', userId, 'in group:', groupId);
    return api.put(`/groups/${groupId}/members/${userId}/make-admin`);
  },
};