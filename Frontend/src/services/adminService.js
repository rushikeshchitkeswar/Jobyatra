import api from '../api/api';

const adminService = {
  // Stats & Analytics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getAnalytics: async () => {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  // User Management
  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  updateUserStatus: async (id, statusData) => {
    const response = await api.patch(`/admin/users/${id}/status`, statusData);
    return response.data;
  },

  updateUserRole: async (id, roleData) => {
    const response = await api.patch(`/admin/users/${id}/role`, roleData);
    return response.data;
  },

  // Recruiter Management
  verifyRecruiter: async (id, verifyData) => {
    const response = await api.patch(`/admin/recruiters/${id}/verify`, verifyData);
    return response.data;
  },

  // Update recruiter status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended'
  updateRecruiterStatus: async (id, status) => {
    const response = await api.patch(`/admin/recruiters/${id}/status`, { status });
    return response.data;
  },

  // Job Management
  getJobs: async (params = {}) => {
    // Admin uses the same job API but might have a special list or can use the public one with specific filters
    const response = await api.get('/jobs', { params: { ...params, status: 'all' } });
    return response.data;
  },

  updateJobStatus: async (id, jobData) => {
    const response = await api.patch(`/admin/jobs/${id}/status`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/admin/jobs/${id}`);
    return response.data;
  },

  // Reports
  getReports: async () => {
    const response = await api.get('/admin/reports');
    return response.data;
  },

  resolveReport: async (id, resolveData) => {
    const response = await api.patch(`/admin/reports/${id}/resolve`, resolveData);
    return response.data;
  },

  // Applications
  getApplications: async () => {
    const response = await api.get('/admin/applications');
    return response.data;
  },

  getApplicationStats: async () => {
    const response = await api.get('/admin/applications/stats');
    return response.data;
  },

  getCompanies: async () => {
    const response = await api.get('/admin/companies');
    return response.data;
  },

  getActivityLogs: async () => {
    const response = await api.get('/admin/logs');
    return response.data;
  },

  broadcastNotification: async (data) => {
    const response = await api.post('/admin/notifications/broadcast', data);
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (data) => {
    const response = await api.patch('/admin/settings', data);
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await api.delete(`/admin/companies/${id}`);
    return response.data;
  }
};

export default adminService;
