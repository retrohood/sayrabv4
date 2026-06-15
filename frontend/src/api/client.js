import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sayrab_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const contentType = response.headers['content-type'] || '';
    if (
      contentType.includes('text/html') &&
      typeof response.data === 'string' &&
      response.data.trim().startsWith('<!')
    ) {
      return Promise.reject(
        new Error(
          'API returned HTML instead of JSON. This typically happens when VITE_API_URL is not configured correctly on Vercel, causing requests to be rewritten to index.html.'
        )
      );
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
