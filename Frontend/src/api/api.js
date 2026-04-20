import axios from 'axios';
import toast from 'react-hot-toast';

/**
 * Centralized Axios instance for JobYatra
 * baseURL: http://localhost:5000/api
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api/',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Log requests (no longer manually attaching tokens).
 */
api.interceptors.request.use(
  (config) => {
    // If data is FormData, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Debugging: Log requests
    // console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Handle global errors (401, 500) and log responses.
 */
api.interceptors.response.use(
  (response) => {
    // Debugging: Log responses
    // console.log(`[API Response] ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    const { response } = error;

    if (response) {
      // Global error handling
      if (response.status === 401) {
        console.warn('[API Error] Unauthorized (401). Redirecting to login...');
      } else if (response.status === 429) {
        // Prevent toast spam during rapid loops
        if (!window.__api_429_toast_active) {
          window.__api_429_toast_active = true;
          toast.error('Too many requests. Please wait a moment and refresh.', {
            onClose: () => { window.__api_429_toast_active = false; }
          });
          setTimeout(() => { window.__api_429_toast_active = false; }, 3000);
        }
        console.error('[API Error] Too Many Requests (429).');
        return Promise.reject(error);
      } else if (response.status === 500) {
        console.error('[API Error] Server Error (500).');
      }

      console.error(`[API Error] ${response.status}: ${response.data.message || 'Something went wrong'}`);
    } else {
      console.error('[API Error] Network Error or Server Down.');
    }

    return Promise.reject(error);
  }
);

export default api;
