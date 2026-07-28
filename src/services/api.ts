import { 
  Client, 
  Project, 
  Payment, 
  Communication, 
  Task, 
  FileItem, 
  AppNotification, 
  AuditLog, 
  AgencySettings, 
  DuplicateWarning, 
  DashboardStats 
} from '../types';

const TOKEN_KEY = 'solvex_master_token';

export function getSessionToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function setSessionToken(token: string, remember: boolean = false) {
  if (remember) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function clearSessionToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['x-master-token'] = token;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearSessionToken();
    window.dispatchEvent(new Event('solvex-unauthorized'));
    throw new Error('Unauthorized session. Master password required.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export const api = {
  getSessionToken: () => getSessionToken(),

  // AUTH
  verifyMasterPassword: async (password: string, remember: boolean = false) => {
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed');
    }
    setSessionToken(data.token, remember);
    return data;
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      clearSessionToken();
    }
  },

  changeMasterPassword: async (currentPassword: string, newPassword: string) => {
    return request<{ success: boolean; message: string }>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
  changePassword: async (currentPassword: string, newPassword: string) => {
    return api.changeMasterPassword(currentPassword, newPassword);
  },

  // DASHBOARD
  getDashboardStats: () => request<DashboardStats>('/api/dashboard'),

  // CLIENTS
  getClients: () => request<Client[]>('/api/clients'),
  checkDuplicateClient: (params: { email?: string; phone?: string; whatsapp?: string; website?: string; excludeId?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ isDuplicate: boolean; warnings: DuplicateWarning[] }>(`/api/clients/check-duplicate?${query}`);
  },
  createClient: (data: Partial<Client>) => request<Client>('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: Partial<Client>) => request<Client>(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) => request<{ success: boolean }>(`/api/clients/${id}`, { method: 'DELETE' }),

  // PROJECTS
  getProjects: () => request<Project[]>('/api/projects'),
  createProject: (data: Partial<Project>) => request<Project>('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: string, data: Partial<Project>) => request<Project>(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: string) => request<{ success: boolean }>(`/api/projects/${id}`, { method: 'DELETE' }),

  // PAYMENTS
  getPayments: () => request<Payment[]>('/api/payments'),
  createPayment: (data: Partial<Payment>) => request<Payment>('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
  recordPayment: (data: Partial<Payment>) => request<Payment>('/api/payments', { method: 'POST', body: JSON.stringify(data) }),
  updatePayment: (id: string, data: Partial<Payment>) => request<Payment>(`/api/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePayment: (id: string) => request<{ success: boolean }>(`/api/payments/${id}`, { method: 'DELETE' }),

  // COMMUNICATIONS
  getCommunications: () => request<Communication[]>('/api/communications'),
  createCommunication: (data: Partial<Communication>) => request<Communication>('/api/communications', { method: 'POST', body: JSON.stringify(data) }),
  deleteCommunication: (id: string) => request<{ success: boolean }>(`/api/communications/${id}`, { method: 'DELETE' }),

  // TASKS
  getTasks: () => request<Task[]>('/api/tasks'),
  createTask: (data: Partial<Task>) => request<Task>('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: Partial<Task>) => request<Task>(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<{ success: boolean }>(`/api/tasks/${id}`, { method: 'DELETE' }),

  // FILES
  getFiles: () => request<FileItem[]>('/api/files'),
  uploadFile: (data: Partial<FileItem>) => request<FileItem>('/api/files', { method: 'POST', body: JSON.stringify(data) }),
  deleteFile: (id: string) => request<{ success: boolean }>(`/api/files/${id}`, { method: 'DELETE' }),

  // NOTIFICATIONS
  getNotifications: () => request<AppNotification[]>('/api/notifications'),
  markNotificationRead: (id: string) => request<{ success: boolean }>(`/api/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),
  clearAllNotifications: () => request<{ success: boolean }>('/api/notifications/read-all', { method: 'PUT' }),

  // SETTINGS & SYSTEM
  getSettings: () => request<Omit<AgencySettings, 'masterPasswordHash'>>('/api/settings'),
  updateSettings: (data: Partial<AgencySettings>) => request<AgencySettings>('/api/settings', { method: 'PUT', body: JSON.stringify(data) }),
  resetDemoData: () => request<{ success: boolean; message: string }>('/api/reset-demo', { method: 'POST' }),
  clearAllData: () => request<{ success: boolean; message: string }>('/api/clear-all', { method: 'POST' }),
  getAuditLogs: () => request<AuditLog[]>('/api/audit-logs'),
  getDatabaseBackup: () => request<unknown>('/api/export'),
  restoreDatabase: (data: unknown) => request<{ success: boolean; message: string }>('/api/restore', { method: 'POST', body: JSON.stringify(data) }),
  restoreDatabaseBackup: (data: unknown) => request<{ success: boolean; message: string }>('/api/restore', { method: 'POST', body: JSON.stringify(data) }),
};
