// User Types
export interface User {
  userId: string;
  username: string;
  email: string;
  displayName?: string;
  bio?: string;
  profilePicture?: string;
  role: 'user' | 'moderator' | 'admin';
  createdAt: string;
  lastLogin?: string;
}

export interface UserProfile extends User {
  location?: {
    city: string;
    country: string;
  };
  preferences: {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    notifications: {
      push: boolean;
      email: boolean;
      chat: boolean;
    };
  };
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    userId: string;
    username: string;
    email: string;
    token: string;
    refreshToken: string;
    role: string;
  };
}

// API Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Photo Types
export interface Photo {
  photoId: string;
  url: string;
  caption?: string;
  userId: string;
  username?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  uploadedAt: string;
  status?: 'pending' | 'approved' | 'rejected';
}

// Chat Types
export interface Message {
  messageId: string;
  senderId: string;
  senderUsername: string;
  message: string;
  timestamp: string;
  roomId?: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface ChatRoom {
  _id: string;
  name: string;
  type: 'private' | 'group' | 'public';
  participants: string[];
  admins: string[];
  createdBy: string;
  createdAt: string;
  lastActivity: string;
  isActive: boolean;
}

// Notification Types
export interface Notification {
  _id: string;
  type: 'message' | 'photo' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

// Admin Types
export interface AdminUser extends User {
  status: 'active' | 'suspended' | 'banned';
}

export interface SystemMetrics {
  timestamp: string;
  activeUsers: number;
  totalPhotos: number;
  pendingReports: number;
  systemLoad: number;
  memoryUsage: number;
}

export interface ChartData {
  title: string;
  type: 'line' | 'pie' | 'bar';
  datasets: Array<{
    label?: string;
    data: any[];
    backgroundColor?: string | string[];
    labels?: string[];
  }>;
}