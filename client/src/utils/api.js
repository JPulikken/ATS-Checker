/**
 * Axios API client configuration.
 * Handles all HTTP communication with the backend.
 */

import axios from 'axios';

// Use environment variable for production, fallback to localhost dev
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s — analysis can take time
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error normalization
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Network error. Please check your connection.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Submits resume + job description for analysis.
 * @param {File} resumeFile - The uploaded resume file
 * @param {string} jobDescription - Job description text
 * @param {function} onUploadProgress - Progress callback (0–100)
 * @returns {Promise<object>} Analysis result data
 */
export async function analyzeResume(resumeFile, jobDescription, onUploadProgress) {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  formData.append('jobDescription', jobDescription);

  const response = await apiClient.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onUploadProgress(pct);
      }
    },
  });

  return response.data;
}

export default apiClient;
