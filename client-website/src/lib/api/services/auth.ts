import { apiClient } from '../client'

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  username: string
  email: string
  password: string
}

interface AuthResponse {
  success: boolean
  data?: {
    user: {
      id: string
      username: string
      email: string
      role: string
    }
    tokens: {
      accessToken: string
      refreshToken: string
    }
  }
  error?: {
    code: string
    message: string
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/login', {
      identifier: credentials.email,
      password: credentials.password
    })
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return apiClient.post('/auth/register', userData)
  },

  async logout(): Promise<{ success: boolean }> {
    return apiClient.post('/auth/logout', {})
  },

  async refreshToken(): Promise<AuthResponse> {
    return apiClient.post('/auth/refresh', {})
  }
}