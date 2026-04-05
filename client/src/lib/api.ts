import { tokenStorage } from './auth';
 
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
 
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
 
export interface TaskPayload {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
}
 
// ─── Token Refresh Logic ─────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];
 
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefresh();
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    // Response: { accessToken, refreshToken }
    tokenStorage.set(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}
 
// ─── Base Fetch ──────────────────────────────────────────────────────────────
async function apiFetch<T>(endpoint: string, options: RequestInit = {}, retry = true): Promise<T> {
  const accessToken = tokenStorage.getAccess();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
 
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
 
  if (res.status === 401 && retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push(async (newToken) => {
          headers['Authorization'] = `Bearer ${newToken}`;
          try {
            const r = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
            resolve(await r.json());
          } catch (e) { reject(e); }
        });
      });
    }
    isRefreshing = true;
    const newToken = await refreshAccessToken();
    isRefreshing = false;
 
    if (!newToken) {
      refreshQueue = [];
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new Error('Session expired');
    }
    refreshQueue.forEach((cb) => cb(newToken));
    refreshQueue = [];
    return apiFetch<T>(endpoint, options, false);
  }
 
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(err.message || 'Request failed');
  }
  return res.json();
}
 
// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
 
  register: (name: string, email: string, password: string) =>
    apiFetch<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
 
  logout: (refreshToken: string) =>
    apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {}),
};
 
// ─── Tasks API ────────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll: (params?: Record<string, string>) => {
    const query = params && Object.keys(params).length
      ? '?' + new URLSearchParams(params).toString()
      : '';
    return apiFetch<any>(`/tasks${query}`);
  },
 
  create: (payload: TaskPayload) =>
    apiFetch<Task>('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
 
  update: (id: string, payload: Partial<TaskPayload>) =>
    apiFetch<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
 
  delete: (id: string) =>
    apiFetch<any>(`/tasks/${id}`, { method: 'DELETE' }),
 
  toggle: (id: string) =>
    apiFetch<Task>(`/tasks/${id}/toggle`, { method: 'PATCH' }),
};