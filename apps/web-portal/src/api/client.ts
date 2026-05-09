import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then((r) => r.data);

// Regions
export const getRegions = () => api.get('/regions').then((r) => r.data);
export const createRegion = (data: { name: string; description?: string }) =>
  api.post('/regions', data).then((r) => r.data);
export const updateRegion = (id: string, data: { name?: string; description?: string }) =>
  api.patch(`/regions/${id}`, data).then((r) => r.data);

// Routes
export const getRoutes = () => api.get('/routes').then((r) => r.data);
export const getRoutesByRegion = (regionId: string) =>
  api.get(`/driver-app/regions/${regionId}/routes`).then((r) => r.data);
export const createRoute = (data: object) => api.post('/routes', data).then((r) => r.data);
export const updateRoute = (id: string, data: object) =>
  api.patch(`/routes/${id}`, data).then((r) => r.data);

// Departures
export const getDepartures = (routeId: string) =>
  api.get(`/departures/route/${routeId}`).then((r) => r.data);
export const createDeparture = (data: object) => api.post('/departures', data).then((r) => r.data);
export const updateDeparture = (id: string, data: object) =>
  api.patch(`/departures/${id}`, data).then((r) => r.data);

// Driver Sessions (live tracking)
export const getActiveSessions = () => api.get('/driver-sessions').then((r) => r.data);
export const endSession = (id: string) =>
  api.post(`/driver-sessions/${id}/end`).then((r) => r.data);

// Activation Codes
export const getActivationCodes = () => api.get('/driver-app/activation-codes').then((r) => r.data);
export const createActivationCode = (data: object) =>
  api.post('/driver-app/activation-codes', data).then((r) => r.data);
export const updateActivationCode = (id: string, data: object) =>
  api.patch(`/driver-app/activation-codes/${id}`, data).then((r) => r.data);

// Vehicle Registrations
export const getVehicles = () => api.get('/driver-app/vehicles').then((r) => r.data);
export const createVehicle = (data: object) =>
  api.post('/driver-app/vehicle-registrations', data).then((r) => r.data);
export const updateVehicle = (id: string, data: object) =>
  api.patch(`/driver-app/vehicle-registrations/${id}`, data).then((r) => r.data);

// Ticketing — products
export const getTicketProducts = () => api.get('/ticketing/products').then((r) => r.data);
export const getTicketProduct = (id: string) =>
  api.get(`/ticketing/products/${id}`).then((r) => r.data);
export const createTicketProduct = (data: object) =>
  api.post('/ticketing/products', data).then((r) => r.data);
export const updateTicketProduct = (id: string, data: object) =>
  api.patch(`/ticketing/products/${id}`, data).then((r) => r.data);

// Ticketing — orders (finance)
export const getTicketOrders = () => api.get('/ticketing/orders').then((r) => r.data);
