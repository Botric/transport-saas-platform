import axios from 'axios';
import type { Region, Route, Departure, LiveData, AuthResponse } from '../types';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('passenger_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data: { name: string; email: string; password: string }) =>
  api.post<AuthResponse>('/auth/register', data).then((r) => r.data);

export const login = (email: string, password: string) =>
  api.post<AuthResponse>('/auth/login', { email, password }).then((r) => r.data);

// Passenger public endpoints
export const getRegions = () =>
  api.get<Region[]>('/passenger/regions').then((r) => r.data);

export const getRoutes = (regionId: string) =>
  api.get<Route[]>(`/passenger/regions/${regionId}/routes`).then((r) => r.data);

export const getDepartures = (routeId: string) =>
  api.get<Departure[]>(`/passenger/routes/${routeId}/departures`).then((r) => r.data);

export const getLive = (routeId: string) =>
  api.get<LiveData>(`/passenger/routes/${routeId}/live`).then((r) => r.data);

export default api;
