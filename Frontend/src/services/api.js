import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

// File APIs
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getFiles = () => api.get('/files/files');

export const deleteFile = (noteId) => api.delete(`/files/files/${noteId}`);

// AI APIs
export const sendChat = (noteId, message) =>
  api.post('/ai/chat', { noteId, message });

export const getChat = (noteId) => api.get(`/ai/chat/${noteId}`);

export const summarizeNote = (noteId) =>
  api.post('/ai/summarize', { noteId });

export const generateQuiz = (noteId, numQuestions = 5) =>
  api.post('/ai/generate-quiz', { noteId, numQuestions });

export const generateFlashcards = (noteId, numCards = 10) =>
  api.post('/ai/generate-flashcards', { noteId, numCards });

// Chat Session APIs
export const createChatSession = (noteId, title = 'New Chat') =>
  api.post('/ai/sessions', { noteId, title });

export const getChatSessions = (noteId) =>
  api.get(`/ai/sessions/${noteId}`);

export const getChatSession = (sessionId) =>
  api.get(`/ai/session/${sessionId}`);

export const addMessageToSession = (sessionId, message) =>
  api.post('/ai/sessions/message', { sessionId, message });

export const deleteChatSession = (sessionId) =>
  api.delete(`/ai/session/${sessionId}`);

// User profile APIs
export const getUserProfile = () => api.get('/auth/profile');

export const deleteUserAccount = () => api.delete('/auth/account');

export default api;
