import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Generous timeout for AI calls
});

// Request interceptor to attach JWT access token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token =
        localStorage.getItem('accessToken') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Track token refresh state to avoid multiple simultaneous refresh requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor with automatic token refresh on 401
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Avoid infinite loop on auth routes or if already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/login') &&
      !originalRequest.url.includes('/auth/signup') &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken) {
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return api(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken: newAccess, token: newTok, refreshToken: newRefresh } =
              res.data.data;
            const freshToken = newAccess || newTok;

            localStorage.setItem('accessToken', freshToken);
            localStorage.setItem('token', freshToken);
            if (newRefresh) {
              localStorage.setItem('refreshToken', newRefresh);
            }

            api.defaults.headers.common.Authorization = `Bearer ${freshToken}`;
            originalRequest.headers.Authorization = `Bearer ${freshToken}`;

            processQueue(null, freshToken);
            return api(originalRequest);
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing = false;
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network error occurred.';

    return Promise.reject(new Error(message));
  }
);

/* ============================================================
   AUTH API SERVICES
   ============================================================ */
export const authApi = {
  signup: (userData) => api.post('/auth/signup', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  addOfficer: (officerData) => api.post('/auth/add-officer', officerData),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

/* ============================================================
   COMPLAINTS API SERVICES (CIVICFIX)
   ============================================================ */
export const complaintApi = {
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  getMine: () => api.get('/complaints/mine'),
  create: (complaintData) => api.post('/complaints', complaintData),
  upvote: (id) => api.patch(`/complaints/${id}/upvote`),
  updateStatus: (id, data) => api.patch(`/complaints/${id}/status`, data),
  submitFeedback: (id, data) => api.patch(`/complaints/${id}/feedback`, data),
  getDuplicates: (params) => api.get('/complaints/duplicates', { params }),
  getStats: () => api.get('/complaints/stats'),
  exportCSV: (params) =>
    api.get('/complaints/export', {
      params,
      responseType: 'blob',
    }),
};

/* ============================================================
   AI SERVICES
   ============================================================ */
export const aiApi = {
  getOfficerSummary: () => api.post('/ai/officer-summary'),
};

/* ============================================================
   LEGACY BOILERPLATE COMPATIBILITY STUBS
   ============================================================ */
export const userApi = {
  getAll: (params) => api.get('/users', { params }).catch(() => ({ data: [] })),
  getById: (id) => api.get(`/users/${id}`).catch(() => ({ data: null })),
  create: (data) => api.post('/users', data).catch(() => ({ data: null })),
  update: (id, data) => api.put(`/users/${id}`, data).catch(() => ({ data: null })),
  delete: (id) => api.delete(`/users/${id}`).catch(() => ({ data: null })),
};

export const resourceApi = {
  getAll: (params) => api.get('/resources', { params }).catch(() => ({ data: [] })),
  getById: (id) => api.get(`/resources/${id}`).catch(() => ({ data: null })),
  create: (data) => api.post('/resources', data).catch(() => ({ data: null })),
  update: (id, data) => api.put(`/resources/${id}`, data).catch(() => ({ data: null })),
  delete: (id) => api.delete(`/resources/${id}`).catch(() => ({ data: null })),
};

/* ============================================================
   HEALTH API
   ============================================================ */
export const healthApi = {
  check: () => api.get('/health'),
};

export default api;
