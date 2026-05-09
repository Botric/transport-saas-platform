import axios from 'axios';
import type { Region, Route, Departure, LiveData, AuthResponse } from '../types';

// In development the Vite proxy rewrites /api → http://localhost:3000 (no prefix).
// In a native Android build set VITE_API_URL=http://<host>:3000 at build time;
// the Capacitor WebView will call that URL directly (paths still relative to root).
const API_BASE = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')
  : '/api';

const api = axios.create({ baseURL: API_BASE });

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
