import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// ============ AUTH APIs ============
export const authAPI = {
  register: (email, password, name) =>
    apiClient.post('/auth/register', { email, password, name }),
  
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getCurrentUser: () =>
    apiClient.get('/auth/me'),
  
  updateProfile: (data) =>
    apiClient.put('/auth/profile', data),
  
  // Gmail OTP authentication
  sendOTP: (data) =>
    apiClient.post('/auth/send-otp', data),
  
  verifyOTP: (data) =>
    apiClient.post('/auth/verify-otp', data),
  
  // Zoom signature
  getZoomSignature: (meetingId, role) =>
    apiClient.post('/auth/zoom-signature', { meetingId, role }),
};

// ============ SESSIONS APIs ============
export const sessionsAPI = {
  createSession: (data) =>
    apiClient.post('/sessions', data),
  
  getSessions: () =>
    apiClient.get('/sessions'),
  
  getSession: (id) =>
    apiClient.get(`/sessions/${id}`),
  
  updateSession: (id, data) =>
    apiClient.put(`/sessions/${id}`, data),
  
  startSession: (id) =>
    apiClient.post(`/sessions/${id}/start`),
  
  endSession: (id) =>
    apiClient.post(`/sessions/${id}/end`),
  
  deleteSession: (id) =>
    apiClient.delete(`/sessions/${id}`),
  
  getAnalytics: (id, period) =>
    apiClient.get(`/sessions/${id}/analytics`, { params: { period } }),
  
  exportData: (id, format = 'csv') =>
    apiClient.get(`/sessions/${id}/export`, {
      params: { format },
      responseType: 'blob',
    }),
  
  getAttendees: (id) =>
    apiClient.get(`/sessions/${id}/attendees`),
};

// ============ POLLS APIs ============
export const pollsAPI = {
  createPoll: (data) =>
    apiClient.post('/polls', data),
  
  getPolls: () =>
    apiClient.get('/polls'),
  
  getPoll: (id) =>
    apiClient.get(`/polls/${id}`),
  
  updatePoll: (id, data) =>
    apiClient.put(`/polls/${id}`, data),
  
  endPoll: (id) =>
    apiClient.post(`/polls/${id}/end`),
  
  deletePoll: (id) =>
    apiClient.delete(`/polls/${id}`),
  
  addResponse: (id, response) =>
    apiClient.post(`/polls/${id}/responses`, response),
  
  getResults: (id) =>
    apiClient.get(`/polls/${id}/results`),
};

// ============ CHAT APIs ============
export const chatAPI = {
  getMessages: (sessionId) =>
    apiClient.get(`/chat/sessions/${sessionId}/messages`),
  
  sendMessage: (sessionId, data) =>
    apiClient.post(`/chat/sessions/${sessionId}/messages`, data),
  
  updateMessage: (sessionId, messageId, data) =>
    apiClient.put(`/chat/sessions/${sessionId}/messages/${messageId}`, data),
  
  deleteMessage: (sessionId, messageId) =>
    apiClient.delete(`/chat/sessions/${sessionId}/messages/${messageId}`),
  
  reactToMessage: (sessionId, messageId, emoji) =>
    apiClient.post(`/chat/sessions/${sessionId}/messages/${messageId}/react`, { emoji }),
};

// ============ ZOOM APIs ============
export const zoomAPI = {
  createMeeting: (data) =>
    apiClient.post('/zoom/create-meeting', data),
  
  getMeetingInfo: (meetingId) =>
    apiClient.get(`/zoom/meeting/${meetingId}`),
  
  getMeetingParticipants: (meetingId) =>
    apiClient.get(`/zoom/meeting/${meetingId}/participants`),
  
  getRecordings: (meetingId) =>
    apiClient.get(`/zoom/meeting/${meetingId}/recordings`),
  
  endMeeting: (meetingId) =>
    apiClient.post(`/zoom/meeting/${meetingId}/end`),
  
  deleteMeeting: (meetingId) =>
    apiClient.delete(`/zoom/meeting/${meetingId}`),
  
  getUserMeetings: () =>
    apiClient.get('/zoom/my-meetings'),
  
  getSDKToken: (meetingId, role) =>
    apiClient.post('/zoom/get-token', { meetingId, role }),
};

export default apiClient;
