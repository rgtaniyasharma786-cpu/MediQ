
import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}api`,
  timeout: 10000,
  withCredentials: true
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

// Doctors
export const doctorsAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  getMyProfile: () => api.get('/doctors/profile/me'),
  updateProfile: (data) => api.put('/doctors/profile/update', data),
  toggleAvailability: () => api.patch('/doctors/availability'),
};

// Queue
export const queueAPI = {
  bookToken: (data) => api.post('/queue/book', data),
  getDoctorQueue: (doctorId, date) => api.get(`/queue/doctor/${doctorId}${date ? `?date=${date}` : ''}`),
  getCurrentToken: (doctorId) => api.get(`/queue/current/${doctorId}`),
  callNext: (doctorId) => api.post(`/queue/next/${doctorId}`),
  skipPatient: (doctorId) => api.post(`/queue/skip/${doctorId}`),
  updateStatus: (tokenId, data) => api.patch(`/queue/${tokenId}/status`, data),
  markEmergency: (tokenId) => api.patch(`/queue/${tokenId}/emergency`),
  getPatientHistory: () => api.get('/queue/patient/history'),
  getPatientToday: () => api.get('/queue/patient/today'),
  cancelToken: (tokenId) => api.delete(`/queue/${tokenId}`),
  resetQueue: (doctorId) => api.post(`/queue/reset/${doctorId}`),
};

// Prescriptions
export const prescriptionAPI = {
  create: (data) => api.post('/prescriptions', data),
  getById: (id) => api.get(`/prescriptions/${id}`),
  getPatientHistory: () => api.get('/prescriptions/patient/history'),
  getDoctorIssued: () => api.get('/prescriptions/doctor/issued'),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  toggleUser: (id) => api.patch(`/admin/users/${id}/toggle`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  createDoctor: (data) => api.post('/admin/doctors', data),
  updateDoctor: (id, data) => api.put(`/admin/doctors/${id}`, data),
  deleteDoctor: (id) => api.delete(`/admin/doctors/${id}`),
  getQueueMonitor: () => api.get('/admin/queue-monitor'),
  getDoctorQueue: (doctorId, date) => api.get(`/admin/queue/${doctorId}${date ? `?date=${date}` : ''}`),
  cancelToken: (tokenId) => api.patch(`/admin/queue/${tokenId}/cancel`),
  resetDoctorQueue: (doctorId) => api.post(`/admin/queue/reset/${doctorId}`),
  // Emergency management
  approveEmergency: (tokenId) => api.patch(`/admin/emergency/approve/${tokenId}`),
  removeEmergency: (tokenId) => api.patch(`/admin/emergency/remove/${tokenId}`),
  getTodayEmergencies: () => api.get('/admin/emergency/today'),
  // System settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

// Analytics
export const analyticsAPI = {
  getPatientsPerDay: () => api.get('/analytics/patients-per-day'),
  getAvgWaitTime: () => api.get('/analytics/avg-wait-time'),
  getStatusDistribution: () => api.get('/analytics/status-distribution'),
  getBySpecialization: () => api.get('/analytics/by-specialization'),
};

// Patients
export const patientsAPI = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getNotifications: () => api.get('/patients/notifications'),
  markRead: (id) => api.patch(`/patients/notifications/${id}/read`),
  markAllRead: () => api.patch('/patients/notifications/read-all'),
};

export default api;

