import { apiClient } from '@/lib/api/client';
import { Photo, PaginatedResponse } from '@/types';

export const photosApi = {
  uploadPhoto: (file: File, latitude: number, longitude: number, caption?: string) => {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    if (caption) formData.append('caption', caption);
    
    return apiClient.upload<Photo>('/photos/upload', formData);
  },

  getUserPhotos: (page = 1, limit = 20) =>
    apiClient.get<PaginatedResponse<Photo>>(`/photos?page=${page}&limit=${limit}`),

  getNearbyPhotos: (latitude: number, longitude: number, radius = 1000) =>
    apiClient.get<{ photos: Photo[] }>(`/photos/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`),

  deletePhoto: (photoId: string) =>
    apiClient.delete(`/photos/${photoId}`),
};