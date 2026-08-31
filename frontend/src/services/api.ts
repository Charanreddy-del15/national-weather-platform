import axios from 'axios';
import { FilterState, WeatherEvent, SystemStats } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('weathervani_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const eventService = {
  getEvents: async (filters: Partial<FilterState> & { limit?: number; offset?: number }) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        params.append(key, String(val));
      }
    });
    const res = await api.get<{ total: number; events: WeatherEvent[] }>(`/events?${params.toString()}`);
    return res.data;
  },

  getMapEvents: async (filters: { state?: string; eventCategory?: string; verificationStatus?: string }) => {
    const params = new URLSearchParams();
    if (filters.state && filters.state !== 'ALL') params.append('state', filters.state);
    if (filters.eventCategory && filters.eventCategory !== 'ALL') params.append('eventCategory', filters.eventCategory);
    if (filters.verificationStatus && filters.verificationStatus !== 'ALL') params.append('verificationStatus', filters.verificationStatus);

    const res = await api.get<{ mapEvents: any[] }>(`/events/map?${params.toString()}`);
    return res.data.mapEvents;
  },

  getStats: async () => {
    const res = await api.get<SystemStats>('/events/stats');
    return res.data;
  },

  getEventById: async (id: string) => {
    const res = await api.get<{ event: WeatherEvent; nearby_reports: WeatherEvent[] }>(`/events/${id}`);
    return res.data;
  },

  updateEvent: async (id: string, payload: { verification_status?: string; event_category?: string; severity?: number; notes?: string }) => {
    const res = await api.patch(`/events/${id}`, payload);
    return res.data;
  },
};

export const analyticsService = {
  getTimeline: async () => (await api.get('/analytics/timeline')).data,
  getGeographic: async () => (await api.get('/analytics/geographic')).data,
  getEvents: async () => (await api.get('/analytics/events')).data,
  getVerification: async () => (await api.get('/analytics/verification')).data,
  getSources: async () => (await api.get('/analytics/sources')).data,
};

export const sourceService = {
  getSources: async () => (await api.get('/sources')).data,
  addSource: async (source: any) => (await api.post('/sources', source)).data,
  toggleSource: async (id: string, is_active: boolean) => (await api.patch(`/sources/${id}`, { is_active })).data,
  poll: async () => (await api.post('/sources/poll')).data,
};

export const citizenService = {
  submitReport: async (formData: FormData) => {
    const res = await axios.post(`${API_BASE_URL}/citizen/reports`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};

export const adminService = {
  getHashtags: async () => (await api.get('/admin/hashtags')).data,
  addHashtag: async (tag: string) => (await api.post('/admin/hashtags', { tag })).data,
  deleteHashtag: async (id: string) => (await api.delete(`/admin/hashtags/${id}`)).data,
  getUsers: async () => (await api.get('/admin/users')).data,
  createUser: async (userData: any) => (await api.post('/admin/users', userData)).data,
  getAuditLogs: async () => (await api.get('/admin/audit-logs')).data,
  getMlStats: async () => (await api.get('/admin/ml-stats')).data,
  getHealth: async () => (await api.get('/admin/health')).data,
};

export const authService = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('weathervani_token', res.data.token);
      localStorage.setItem('weathervani_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('weathervani_token');
    localStorage.removeItem('weathervani_user');
  },
  getCurrentUser: () => {
    const u = localStorage.getItem('weathervani_user');
    return u ? JSON.parse(u) : null;
  },
};

export default api;
