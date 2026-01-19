import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:8080/api', // Tu backend Spring Boot
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Antes de que salga la petición, le pega el token si existe
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default client;