import { apiClient } from '@/lib/api/client';
import { UserProfile } from '@/types';

export const userApi = {
  getProfile: () =>
    apiClient.get<UserProfile>('/users/profile'),

  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.put<UserProfile>('/users/profile', data),

  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    return apiClient.upload<{ profilePicture: string }>('/users/profile-picture/upload', formData);
  },

  blockUser: (userId: string) =>
    apiClient.post('/users/block', { userId }),
};