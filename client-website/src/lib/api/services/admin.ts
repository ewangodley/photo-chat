import { apiClient } from '@/lib/api/client';
import { AdminUser, SystemMetrics, ChartData, PaginatedResponse } from '@/types';

export const adminApi = {
  // User Management
  getAllUsers: (page = 1, limit = 20, status?: string, search?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
      ...(search && { search })
    });
    return apiClient.get<PaginatedResponse<AdminUser>>(`/admin/users?${params}`);
  },

  updateUserStatus: (userId: string, status: 'active' | 'suspended' | 'banned', reason?: string) =>
    apiClient.put(`/admin/users/${userId}/status`, { status, reason }),

  // Photo Moderation
  getPhotosForModeration: (status = 'pending', page = 1, limit = 20) => {
    const params = new URLSearchParams({
      status,
      page: page.toString(),
      limit: limit.toString()
    });
    return apiClient.get(`/admin/photos?${params}`);
  },

  moderatePhoto: (photoId: string, action: 'approve' | 'reject', reason?: string) =>
    apiClient.put(`/admin/photos/${photoId}/moderate`, { action, reason }),

  // Analytics
  getAnalytics: (period = '7d') =>
    apiClient.get(`/admin/analytics?period=${period}`),

  getChartData: (type: 'users' | 'photos' | 'reports') =>
    apiClient.get<ChartData>(`/admin/dashboard/charts/${type}`),

  // System Monitoring
  getSystemMetrics: () =>
    apiClient.get<SystemMetrics>('/admin/dashboard/realtime'),

  getServiceHealth: () =>
    apiClient.get('/admin/system/health'),

  // Reports
  getReports: (page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    return apiClient.get(`/admin/reports?${params}`);
  },

  resolveReport: (reportId: string, resolution: string) =>
    apiClient.put(`/admin/reports/${reportId}/resolve`, { resolution }),

  // System Actions
  sendAnnouncement: (title: string, message: string) =>
    apiClient.post('/admin/announcements', { title, message }),

  exportData: (type: 'users' | 'photos' | 'analytics', format: 'csv' | 'pdf' | 'excel') =>
    apiClient.get(`/admin/export/${type}?format=${format}`),
};