import axios from 'axios';

export const getApiBaseUrl = () => {
  // 1. If explicit environment variable is configured, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // 2. In browser environment on any deployed host (Vercel, custom domain, etc.)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return 'https://civilainportalcoordinative-production.up.railway.app/api';
    }
  }

  // 3. Default fallback for local development
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Generous timeout for AI calls
});

// Request interceptor to dynamically update baseURL and attach JWT access token
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();

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
    const currentBaseUrl = getApiBaseUrl();

    // Avoid infinite loop on auth routes or if already retried
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/signup') &&
      !originalRequest.url?.includes('/auth/refresh')
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
            const res = await axios.post(`${currentBaseUrl}/auth/refresh`, {
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
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getMe: () => api.get('/auth/me'),
};

/* ============================================================
   COMPLAINTS API SERVICES (AWAZ)
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
  getHotspots: () => api.get('/complaints/hotspots'),
  assignTechnician: (id, technicianId) => api.patch(`/complaints/${id}/assign`, { technicianId }),
  exportCSV: (params) =>
    api.get('/complaints/export', {
      params,
      responseType: 'blob',
    }),
};

/* ============================================================
   STAFF MANAGEMENT API SERVICES
   ============================================================ */
export const staffApi = {
  // List all staff (super officer = all; officer = own technicians)
  getAll: () => api.get('/staff'),
  // List only officers (for dropdowns)
  getOfficers: () => api.get('/staff/officers'),
  // List technicians under the requesting officer
  getMyTechnicians: () => api.get('/staff/technicians'),
  // Super officer: provision a new officer or technician account
  provision: (data) => api.post('/staff/provision', data),
  // Super officer: assign a technician to an officer
  assignOfficer: (technicianId, officerId) =>
    api.patch(`/staff/${technicianId}/assign-officer`, { officerId }),
  // Super officer: remove a staff member
  remove: (id) => api.delete(`/staff/${id}`),
};

/* ============================================================
   UPLOAD API SERVICES (Cloudinary)
   ============================================================ */
export const uploadApi = {
  uploadImage: async (file, type = 'evidence') => {
    const formData = new FormData();
    formData.append('image', file);

    const token = typeof window !== 'undefined'
      ? localStorage.getItem('accessToken') || localStorage.getItem('token')
      : null;

    const currentBaseUrl = getApiBaseUrl();

    const res = await axios.post(`${currentBaseUrl}/upload?type=${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    return res.data;
  },
};

/* ============================================================
   AI SERVICES (Gemini)
   ============================================================ */
export const aiApi = {
  getOfficerSummary: () => api.post('/ai/officer-summary'),
  analyzeComplaint: (draft) => api.post('/ai/analyze-complaint', draft),
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
