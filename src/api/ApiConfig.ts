import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta (opcional, pero recomendado)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token expiró o es inválido, podrías redirigir al login aquí
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Descomentar si deseas redirigir
    }
    return Promise.reject(error);
  }
);

export default api;
