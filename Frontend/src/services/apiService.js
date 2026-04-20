import api from '../api/api';

/**
 * API Service for JobYatra
 * Connects to the backend REST API for all job-related operations.
 */
export const apiService = {
  /**
   * Fetch jobs using query parameters.
   * @param {Object} filters - Search and filter parameters.
   */
  async getJobs(filters = {}) {
    try {
      const response = await api.get('jobs', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error.response?.data?.message || 'Failed to fetch jobs';
    }
  },

  /**
   * Fetch a specific job by ID.
   * @param {string} id - The job ID.
   */
  async getJobById(id) {
    try {
      const response = await api.get(`jobs/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching job ${id}:`, error);
      throw error.response?.data?.message || 'Failed to fetch job details';
    }
  },

  /**
   * Submit a job application.
   * @param {string} jobId - The job ID to apply for.
   * @param {Object} applicationData - Form data including resume, etc.
   */
  async submitApplication(jobId, applicationData) {
    try {
      // When applicationData is FormData, let the browser set Content-Type
      // with the correct multipart boundary automatically.
      const isFormData = typeof FormData !== 'undefined' && applicationData instanceof FormData;
      const config = isFormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : {};
      const response = await api.post(`/jobs/${jobId}/apply`, applicationData, config);
      return response.data;
    } catch (error) {
      console.error('Error submitting application:', error);
      const message = error.response?.data?.message || 'Failed to submit application';
      throw new Error(message);
    }
  },

  /**
   * Create a new job listing (Recruiter only).
   * @param {Object} jobData - Job details.
   */
  async createJob(jobData) {
    try {
      const response = await api.post('/jobs/create', jobData);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error.response?.data?.message || 'Failed to create job';
    }
  },

  async updateJob(id, jobData) {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  async deleteJob(id) {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Get jobs posted by the current recruiter.
   */
  async getMyJobs() {
    try {
      const response = await api.get('jobs/recruiter/my-jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching recruiter jobs:', error);
      throw error.response?.data?.message || 'Failed to fetch your jobs';
    }
  },

  // Recruiter Dashboard & Profile
  async getDashboardStats() {
    const response = await api.get('recruiter/stats');
    return response.data;
  },

  async getRecruiterAnalytics() {
    const response = await api.get('recruiter/analytics');
    return response.data;
  },

  async getRecruiterProfile() {
    const response = await api.get('recruiter/profile');
    return response.data;
  },

  async updateRecruiterProfile(data) {
    const response = await api.post('/recruiter/profile', data);
    return response.data;
  },

  async uploadImage(file, folder = 'general') {
    const formData = new FormData();
    formData.append('folder', folder);
    formData.append('image', file);
    
    const response = await api.post('upload', formData);
    return response.data;
  },

  // Applications
  async getJobApplications(jobId = '') {
    const url = jobId ? `/recruiter/applications?jobId=${jobId}` : '/recruiter/applications';
    const response = await api.get(url);
    return response.data;
  },

  async getApplicationById(id) {
    const response = await api.get(`/recruiter/applications/${id}`);
    return response.data;
  },

  async getHiringPipeline(jobId) {
    const response = await api.get(`recruiter/pipeline/${jobId}`);
    return response.data;
  },

  async updateApplicationStatus(id, status) {
    const response = await api.patch(`recruiter/applications/${id}/status`, { status });
    return response.data;
  },

  // Interviews
  async scheduleInterview(data) {
    const response = await api.post('/interviews/schedule', data);
    return response.data;
  },

  async getMyInterviews() {
    const response = await api.get('/interviews/me');
    return response.data;
  },

  async updateInterview(id, data) {
    const response = await api.patch(`/interviews/${id}`, data);
    return response.data;
  },

  async deleteInterview(id) {
    const response = await api.delete(`/interviews/${id}`);
    return response.data;
  },

  // Notifications
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markNotificationRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markNotificationUnread(id) {
    const response = await api.patch(`/notifications/${id}/unread`);
    return response.data;
  },

  async getUnreadNotificationsCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  async markAllNotificationsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  async clearAllNotifications() {
    const response = await api.delete('/notifications');
    return response.data;
  }
};
