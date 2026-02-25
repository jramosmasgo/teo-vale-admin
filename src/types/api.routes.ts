export const API_ROUTES = {
  AUTH: {
    LOGIN: '/users/login',
  },
  USERS: {
    GET_ALL: '/users',
    GET_BY_ID: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
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
    GET_BY_CLIENT: (clientId: string) => `/shipments/client/${clientId}`,
    GENERATE_FOR_ORDER: (orderId: string) => `/shipments/generate-for-order/${orderId}`,
  },
  PAYMENTS: {
    GET_ALL: '/payments',
    CREATE: '/payments',
    GET_BY_ID: (id: string) => `/payments/${id}`,
    UPDATE: (id: string) => `/payments/${id}`,
    DELETE: (id: string) => `/payments/${id}`,
  },
  QR: {
    GET_BY_TOKEN: (token: string) => `/qr/${token}`,
    GET_CLIENT_QR: (clientId: string) => `/qr/client/${clientId}`,
  },
  EXCEL: {
    PAYMENTS:   '/excel/payments',
    DELIVERIES: '/excel/deliveries',
  },
  NOTIFICATIONS: {
    GET_ALL: '/notifications',
    MARK_AS_SEEN: (id: string) => `/notifications/${id}/seen`,
    MARK_ALL_AS_SEEN: '/notifications/seen-all',
    CLEANUP: '/notifications/cleanup',
  },
};
