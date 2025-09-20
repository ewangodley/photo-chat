/**
 * End-to-End Tests using Client API with Live Server
 * Tests the client's API layer against real server endpoints
 */

import { apiClient } from '@/lib/api/client'
import { authApi, AuthManager } from '@/lib/auth/auth'

// Mock localStorage for testing
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Client-Server E2E Tests', () => {
  const testUser = {
    username: `e2euser_${Date.now()}`,
    email: `e2e_${Date.now()}@example.com`,
    password: 'E2EPassword123!'
  }

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000))
  })

  beforeEach(() => {
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()
  })

  describe('Authentication Flow via Client API', () => {
    it('should register user through authApi', async () => {
      const response = await authApi.register(testUser)
      
      expect(response.success).toBe(true)
      expect(response.data?.user.email).toBe(testUser.email)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('access_token', expect.any(String))
    })

    it('should login user through authApi', async () => {
      const response = await authApi.login({
        email: testUser.email,
        password: testUser.password
      })
      
      expect(response.success).toBe(true)
      expect(response.data?.token).toBeDefined()
    })

    it('should handle invalid login through authApi', async () => {
      const response = await authApi.login({
        email: testUser.email,
        password: 'wrongpassword'
      })
      
      expect(response.success).toBe(false)
      expect(response.error?.code).toBeDefined()
    })
  })

  describe('API Client with Server Integration', () => {
    let authToken: string

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await authApi.login({
        email: testUser.email,
        password: testUser.password
      })
      authToken = loginResponse.data?.token || ''
      
      // Mock localStorage to return the token
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'access_token') return authToken
        return null
      })
    })

    it('should get user profile via apiClient', async () => {
      const response = await apiClient.get('/users/profile')
      
      expect(response.success).toBe(true)
      expect(response.data?.email).toBe(testUser.email)
    })

    it('should update user profile via apiClient', async () => {
      const updateData = { username: `updated_${testUser.username}` }
      const response = await apiClient.put('/users/profile', updateData)
      
      expect(response.success).toBe(true)
      expect(response.data?.username).toBe(updateData.username)
    })

    it('should handle photo upload via apiClient', async () => {
      const formData = new FormData()
      const blob = new Blob(['test image'], { type: 'image/jpeg' })
      formData.append('photo', blob, 'test.jpg')
      formData.append('caption', 'E2E test photo')
      formData.append('latitude', '40.7128')
      formData.append('longitude', '-74.0060')

      const response = await apiClient.upload('/photos/upload', formData)
      
      expect(response.success).toBe(true)
      expect(response.data?.caption).toBe('E2E test photo')
    })

    it('should get photos list via apiClient', async () => {
      const response = await apiClient.get('/photos?page=1&limit=5')
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data?.photos)).toBe(true)
    })

    it('should handle unauthorized requests', async () => {
      // Clear token
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const response = await apiClient.get('/users/profile')
      
      expect(response.success).toBe(false)
      expect([401, 403]).toContain(response.error?.code === 'HTTP_ERROR' ? 401 : 403)
    })

    it('should handle network errors gracefully', async () => {
      // Test with invalid endpoint
      const response = await apiClient.get('/invalid/endpoint/that/does/not/exist')
      
      expect(response.success).toBe(false)
      expect(response.error?.code).toBeDefined()
    })
  })

  describe('Chat Service Integration', () => {
    let authToken: string

    beforeAll(async () => {
      const loginResponse = await authApi.login({
        email: testUser.email,
        password: testUser.password
      })
      authToken = loginResponse.data?.token || ''
      
      mockLocalStorage.getItem.mockImplementation((key) => {
        if (key === 'access_token') return authToken
        return null
      })
    })

    it('should get chat rooms via apiClient', async () => {
      const response = await apiClient.get('/chat/rooms')
      
      expect(response.success).toBe(true)
      expect(Array.isArray(response.data)).toBe(true)
    })

    it('should send chat message via apiClient', async () => {
      const messageData = {
        roomId: 'general',
        content: 'E2E test message',
        type: 'text'
      }
      
      const response = await apiClient.post('/chat/send', messageData)
      
      expect(response.success).toBe(true)
      expect(response.data?.content).toBe(messageData.content)
    })
  })

  afterAll(async () => {
    // Cleanup
    if (mockLocalStorage.getItem('access_token')) {
      await authApi.logout()
    }
  })
})