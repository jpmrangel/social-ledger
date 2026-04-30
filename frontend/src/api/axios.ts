/*
 * axios.ts
 * Centralized HTTP client configuration. Automatically intercepts 
 * every outgoing API request to inject the custom 'X-User-Id' header, 
 * powering the stateless authentication system.
 */

import axios from 'axios';

// Uses a relative path. Nginx handles the reverse proxy to the API container.
const api = axios.create({
  baseURL: '/api'
});

// The Interceptor: Runs before every single request leaves the browser
api.interceptors.request.use(config => {
  // Check if a user session exists in the browser's local storage
  const userJson = localStorage.getItem('user');
  
  if (userJson) {
    const user = JSON.parse(userJson);
    // Attach the stateless identifier to the headers
    config.headers['X-User-Id'] = user.id;
  }
  
  return config;
});

export default api;