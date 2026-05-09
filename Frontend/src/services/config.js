const isDevelopment = process.env.NODE_ENV === 'development';

export const API_BASE_URL = process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:5000/api' : '/api');

export const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

export const getApiUrl = (path) => {
  return `${API_BASE_URL}${path}`;
};