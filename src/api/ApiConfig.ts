import axios from 'axios';

const api = axios.create({
  //baseURL: 'http://localhost:3000/api',
  baseURL: 'https://teo-vale-api.vercel.app/api',
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

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response ? error.response.data : '';

    if (
      status === 401 || 
      message === 'SESION_NO_VALIDA' || 
      message === 'NO_TIENES_UNA_SESION_VALIDA'
    ) {
      localStorage.removeItem('token');
      localStorage.removeItem('user'); // También limpiamos el usuario si existe
      
      // Redirigir al login si no estamos ya en una página pública
      if (!window.location.pathname.startsWith('/auth') && !window.location.pathname.startsWith('/client')) {
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
