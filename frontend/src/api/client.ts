import axios from 'axios';

// Create a generic Axios instance
export const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

// Intercept requests to inject the JWT token automatically
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept errors (e.g. 401 Unauthorized) to redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect using native location (or router logic)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
