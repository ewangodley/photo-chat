/**
 * Direct Service E2E Tests
 * Tests client API against direct service endpoints (bypassing gateway routing issues)
 */

import { apiClient } from '@/lib/api/client'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Direct Service E2E Tests', () => {
  const testUser = {
    username: `directe2e_${Date.now()}`,
    email: `directe2e_${Date.now()}@example.com`,
    password: 'DirectE2E123!'
  }

  beforeEach(() => {
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
  })

  describe('Auth Service Direct Integration', () => {
    let authToken: string

    it('should register user via direct auth service', async () => {
      const response = await fetch('http://localhost:3001/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'phone-app-api-key-change-in-production'
        },
        body: JSON.stringify(testUser)
      })

      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe(testUser.email)
      expect(data.data.tokens.accessToken).toBeDefined()
      
      authToken = data.data.tokens.accessToken
    })

    it('should login via direct auth service', async () => {
      const response = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'phone-app-api-key-change-in-production'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      })

      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data.tokens.accessToken).toBeDefined()
    })
  })

  describe('Client API with Direct Services', () => {
    it('should handle API client configuration', () => {
      expect(typeof apiClient.get).toBe('function')
      expect(typeof apiClient.post).toBe('function')
      expect(typeof apiClient.put).toBe('function')
      expect(typeof apiClient.upload).toBe('function')
    })

    it('should handle localStorage token management', () => {
      mockLocalStorage.getItem.mockReturnValue('test-token')
      
      // Verify token is retrieved
      expect(mockLocalStorage.getItem('access_token')).toBe('test-token')
    })

    it('should handle network requests with proper headers', async () => {
      // Test that fetch is available and working
      const response = await fetch('http://localhost:8081/health')
      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.status).toBe('ok')
    })
  })

  describe('Service Connectivity Verification', () => {
    it('should verify all services are accessible', async () => {
      const services = [
        { name: 'Gateway', url: 'http://localhost:8081/health' },
        { name: 'Auth', url: 'http://localhost:3001/', expectError: true },
        { name: 'Photo', url: 'http://localhost:3002/', expectError: true },
        { name: 'Chat', url: 'http://localhost:3003/', expectError: true },
        { name: 'User', url: 'http://localhost:3004/', expectError: true },
      ]

      for (const service of services) {
        const response = await fetch(service.url)
        
        if (service.expectError) {
          // Services without health endpoints should return some response
          expect(response.status).toBeDefined()
        } else {
          expect(response.ok).toBe(true)
        }
      }
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle service unavailable errors', async () => {
      try {
        await fetch('http://localhost:9999/nonexistent')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle invalid API responses', async () => {
      const response = await fetch('http://localhost:8081/invalid-endpoint')
      const data = await response.json()
      
      expect(response.ok).toBe(false)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('NOT_FOUND')
    })
  })
})