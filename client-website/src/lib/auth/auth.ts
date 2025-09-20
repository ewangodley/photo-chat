import { apiClient } from '@/lib/api/client';
import { AuthResponse, LoginCredentials, RegisterData, User } from '@/types';

export class AuthManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user_data';

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  static setUser(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  static hasRole(requiredRole: 'user' | 'moderator' | 'admin'): boolean {
    const user = this.getUser();
    if (!user) return false;

    const roleHierarchy = { user: 0, moderator: 1, admin: 2 };
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  }
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse['data']>('/auth/login', credentials);
    
    if (response.success && response.data) {
      AuthManager.setTokens(response.data.token, response.data.refreshToken);
      AuthManager.setUser({
        userId: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role as 'user' | 'moderator' | 'admin',
        createdAt: new Date().toISOString()
      });
    }
    
    return response as AuthResponse;
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse['data']>('/auth/register', userData);
    
    if (response.success && response.data) {
      AuthManager.setTokens(response.data.token, response.data.refreshToken);
      AuthManager.setUser({
        userId: response.data.userId,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role as 'user' | 'moderator' | 'admin',
        createdAt: new Date().toISOString()
      });
    }
    
    return response as AuthResponse;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      AuthManager.clearAuth();
    }
  },

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = AuthManager.getRefreshToken();
      if (!refreshToken) return false;

      const response = await apiClient.post('/auth/refresh', null, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });

      if (response.success && response.data) {
        AuthManager.setTokens(response.data.token, response.data.refreshToken);
        return true;
      }
      
      return false;
    } catch {
      AuthManager.clearAuth();
      return false;
    }
  }
};