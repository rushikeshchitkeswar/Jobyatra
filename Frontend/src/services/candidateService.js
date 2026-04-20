import api from '../api/api';

/**
 * Service for Candidate Dashboard APIs
 */
export const candidateService = {
  /**
   * Get current candidate profile (Professional Redesign)
   */
  async getProfile() {
    try {
      const response = await api.get('/candidate/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching candidate profile:', error);
      throw error.response?.data?.message || 'Failed to fetch profile';
    }
  },

  /**
   * Update candidate profile basic info
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/candidate/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Error updating candidate profile:', error);
      throw error.response?.data?.message || 'Failed to update profile';
    }
  },

  /**
   * Education CRUD
   */
  async addEducation(data) {
    const response = await api.post('/candidate/education', data);
    return response.data;
  },
  async updateEducation(id, data) {
    const response = await api.put(`/candidate/education/${id}`, data);
    return response.data;
  },
  async deleteEducation(id) {
    const response = await api.delete(`/candidate/education/${id}`);
    return response.data;
  },

  /**
   * Experience CRUD
   */
  async addExperience(data) {
    const response = await api.post('/candidate/experience', data);
    return response.data;
  },
  async updateExperience(id, data) {
    const response = await api.put(`/candidate/experience/${id}`, data);
    return response.data;
  },
  async deleteExperience(id) {
    const response = await api.delete(`/candidate/experience/${id}`);
    return response.data;
  },

  /**
   * Skills
   */
  async addSkill(data) {
    const response = await api.put('/candidate/skills', data);
    return response.data;
  },
  async deleteSkill(id) {
    const response = await api.delete(`/candidate/skills/${id}`);
    return response.data;
  },

  /**
   * Certifications CRUD
   */
  async addCertification(data) {
    const response = await api.post('/candidate/certifications', data);
    return response.data;
  },
  async updateCertification(id, data) {
    const response = await api.put(`/candidate/certifications/${id}`, data);
    return response.data;
  },
  async deleteCertification(id) {
    const response = await api.delete(`/candidate/certifications/${id}`);
    return response.data;
  },

  /**
   * Projects CRUD
   */
  async addProject(data) {
    const response = await api.post('/candidate/projects', data);
    return response.data;
  },
  async updateProject(id, data) {
    const response = await api.put(`/candidate/projects/${id}`, data);
    return response.data;
  },
  async deleteProject(id) {
    const response = await api.delete(`/candidate/projects/${id}`);
    return response.data;
  },

  /**
   * Languages CRUD
   */
  async addLanguage(data) {
    const response = await api.post('/candidate/languages', data);
    return response.data;
  },
  async deleteLanguage(id) {
    const response = await api.delete(`/candidate/languages/${id}`);
    return response.data;
  },

  /**
   * Resume Management
   */
  async uploadResume(formData) {
    const response = await api.post('/candidate/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  async deleteResume(id) {
    const response = await api.delete(`/candidate/profile/resume/${id}`);
    return response.data;
  },

  /**
   * Photo Management
   */
  async uploadPhoto(formData) {
    const response = await api.post('/candidate/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    try {
      const response = await api.get('/candidate/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error.response?.data?.message || 'Failed to fetch stats';
    }
  },

  /**
   * Get candidate's scheduled interviews
   */
  async getDashboardInterviews() {
    try {
      const response = await api.get('/candidate/interviews');
      return response.data;
    } catch (error) {
      console.error('Error fetching interviews:', error);
      throw error.response?.data?.message || 'Failed to fetch interviews';
    }
  },

  /**
   * Alias for compatibility
   */
  async getInterviews() {
    return this.getDashboardInterviews();
  },

  /**
   * Get analytics data for charts
   */
  async getAnalytics() {
    try {
      const response = await api.get('/candidate/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error.response?.data?.message || 'Failed to fetch analytics';
    }
  },

  /**
   * Get AI-powered smart insights
   */
  async getInsights() {
    try {
      const response = await api.get('/candidate/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error.response?.data?.message || 'Failed to fetch insights';
    }
  },

  /**
   * Get tracking applications for Kanban
   */
  async getApplicationTracking() {
    try {
      const response = await api.get('/candidate/applications');
      return response.data;
    } catch (error) {
      console.error('Error fetching applied jobs:', error);
      throw error.response?.data?.message || 'Failed to fetch tracking data';
    }
  },

  /**
   * Alias for Kanban compatibility
   */
  async getAppliedJobs() {
    return this.getApplicationTracking();
  },

  /**
   * Get saved jobs
   */
  async getSavedJobs() {
    try {
      const response = await api.get('/candidate/saved-jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
      throw error.response?.data?.message || 'Failed to fetch saved jobs';
    }
  },

  /**
   * Toggle save job
   */
  async toggleSaveJob(jobId) {
    try {
      // console.log("DEBUG: candidateService.toggleSaveJob sending to /api/jobs/save with body:", { jobId });
      const response = await api.post('/jobs/save', { jobId });
      // console.log("DEBUG: candidateService.toggleSaveJob response:", response.data);
      return response.data;
    } catch (error) {
      console.error('DEBUG: candidateService.toggleSaveJob error:', error);
      throw error.response?.data?.message || 'Failed to save job';
    }
  },

  /**
   * Get recommended jobs
   */
  async getRecommendedJobs() {
    try {
      const response = await api.get('/candidate/recommended-jobs');
      return response.data;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      throw error.response?.data?.message || 'Failed to fetch recommendations';
    }
  },

  /**
   * Get candidate activity/notifications
   */
  async getActivityFeed() {
    try {
      const response = await api.get('/candidate/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notification activity:', error);
      throw error.response?.data?.message || 'Failed to fetch activity feed';
    }
  },

  /**
   * Get job alerts
   */
  async getJobAlerts() {
    try {
      const response = await api.get('/candidate/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching job alerts:', error);
      throw error.response?.data?.message || 'Failed to fetch job alerts';
    }
  },

  /**
   * Create job alert
   */
  async createJobAlert(alertData) {
    try {
      const response = await api.post('/candidate/alerts', alertData);
      return response.data;
    } catch (error) {
      console.error('Error creating job alert:', error);
      throw error.response?.data?.message || 'Failed to create job alert';
    }
  },

  /**
   * Delete job alert
   */
  async deleteJobAlert(id) {
    try {
      const response = await api.delete(`/candidate/alerts/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job alert:', error);
      throw error.response?.data?.message || 'Failed to delete job alert';
    }
  },
};
