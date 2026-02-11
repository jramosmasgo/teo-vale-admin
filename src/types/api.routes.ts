export const API_ROUTES = {
  AUTH: {
    LOGIN: '/users/login',
  },
  USERS: {
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
  },
  CLIENTS: {
    GET_ALL: '/clients',
    CREATE: '/clients',
    GET_BY_ID: (id: string) => `/clients/${id}`,
    UPDATE: (id: string) => `/clients/${id}`,
  },
  ORDERS: {
    GET_ALL: '/orders',
    CREATE: '/orders',
    GET_BY_ID: (id: string) => `/orders/${id}`,
    UPDATE: (id: string) => `/orders/${id}`,
    GET_BY_CLIENT: (clientId: string) => `/orders/client/${clientId}`,
  },
  SHIPMENTS: {
    GET_ALL: '/shipments',
    CREATE: '/shipments',
    GET_BY_ID: (id: string) => `/shipments/${id}`,
    UPDATE: (id: string) => `/shipments/${id}`,
  },
  PAYMENTS: {
    GET_ALL: '/payments',
    CREATE: '/payments',
    GET_BY_ID: (id: string) => `/payments/${id}`,
    UPDATE: (id: string) => `/payments/${id}`,
    DELETE: (id: string) => `/payments/${id}`,
  },
};
