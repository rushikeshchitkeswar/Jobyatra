import api from '../api/api';
import { setUser, getUser, clearAuthData } from '../utils/authUtils';

/**
 * Authentication Service for JobYatra
 * Includes login, register, logout, and getCurrentUser.
 */
const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password, role }
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        // User data might be returned
        if (response.data.user) {
          setUser(response.data.user);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Registration failed';
    }
  },

  /**
   * Login a user
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success) {
        // Token is in the HTTP-only cookie now.
        // We only store the user object in localStorage for UI purposes.
        if (response.data.user) {
          setUser(response.data.user);
        }
      }
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  /**
   * Get current authenticated user from backend (verifies cookie)
   */
  async getMe() {
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        setUser(userData);
        return userData;
      }
      // If success is false, it means no session exists (now returns 200 instead of 401)
      clearAuthData();
      return null;
    } catch (error) {
      clearAuthData();
      return null;
    }
  },

  /**
   * Logout a user
   */
  async logout() {
    try {
      await api.get('/auth/logout');
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      clearAuthData();
      window.location.href = '/login';
    }
  },

  /**
   * Get the current user from localStorage (UI only)
   */
  getCurrentUser() {
    return getUser();
  },

  /**
   * Check if a user is authenticated (Check for user in state/storage)
   * Note: Final verification should be via getMe()
   */
  isAuthenticated() {
    return !!getUser();
  },

  /**
   * Check if the current user has a specific role
   * @param {string} role - 'user', 'recruiter', 'admin'
   */
  hasRole(role) {
    const user = this.getCurrentUser();
    return user && user.role === role;
  },

  /**
   * Update user basic details
   */
  async updateDetails(userData) {
    const response = await api.patch('/auth/update-details', userData);
    if (response.data.success) {
      setUser(response.data.data);
    }
    return response.data;
  },

  /**
   * Change user password
   */
  async updatePassword(passwordData) {
    const response = await api.patch('/auth/update-password', passwordData);
    return response.data;
  },

  /**
   * Update user preferences
   */
  async updatePreferences(preferences) {
    const response = await api.patch('/auth/preferences', preferences);
    if (response.data.success) {
      const currentUser = getUser();
      setUser({ ...currentUser, preferences: response.data.data });
    }
    return response.data;
  }
};

export default authService;
