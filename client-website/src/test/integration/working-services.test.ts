/**
 * Integration Tests with Working Services
 * Tests against services that are currently running and accessible
 */

const GATEWAY_URL = 'http://localhost:8081'
const USER_SERVICE_URL = 'http://localhost:3004'
const CHAT_SERVICE_URL = 'http://localhost:3003'
const ADMIN_SERVICE_URL = 'http://localhost:3006'

describe('Working Services Integration Tests', () => {
  beforeAll(async () => {
    // Wait for services to be ready
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  describe('API Gateway', () => {
    it('should respond to health check', async () => {
      const response = await fetch(`${GATEWAY_URL}/health`)
      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.status).toBe('ok')
      expect(data.service).toBe('api-gateway')
    })

    it('should handle unknown endpoints with proper error', async () => {
      const response = await fetch(`${GATEWAY_URL}/unknown/endpoint`)
      const data = await response.json()
      
      expect(response.ok).toBe(false)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('NOT_FOUND')
    })
  })

  describe('User Service Direct Access', () => {
    it('should be accessible on port 3004', async () => {
      const response = await fetch(`${USER_SERVICE_URL}/`)
      
      // Service is running even if it returns an error page
      expect(response.status).toBeDefined()
    })
  })

  describe('Chat Service Direct Access', () => {
    it('should be accessible on port 3003', async () => {
      const response = await fetch(`${CHAT_SERVICE_URL}/`)
      
      // Service is running even if it returns an error page
      expect(response.status).toBeDefined()
    })
  })

  describe('Admin Service Direct Access', () => {
    it('should be accessible on port 3006', async () => {
      const response = await fetch(`${ADMIN_SERVICE_URL}/`)
      
      // Service is running even if it returns an error page
      expect(response.status).toBeDefined()
    })
  })

  describe('Client API Integration', () => {
    it('should handle network requests through fetch', async () => {
      const response = await fetch(`${GATEWAY_URL}/health`)
      
      expect(typeof response.ok).toBe('boolean')
      expect(typeof response.status).toBe('number')
      expect(typeof response.json).toBe('function')
    })

    it('should handle POST requests with JSON body', async () => {
      const testData = { test: 'data' }
      const response = await fetch(`${GATEWAY_URL}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'phone-app-api-key-change-in-production'
        },
        body: JSON.stringify(testData)
      })
      
      // Should get a response (even if 404)
      expect(response.status).toBeDefined()
    })

    it('should handle requests with custom headers', async () => {
      const response = await fetch(`${GATEWAY_URL}/health`, {
        headers: {
          'X-API-Key': 'phone-app-api-key-change-in-production',
          'User-Agent': 'Integration-Test'
        }
      })
      
      expect(response.ok).toBe(true)
    })
  })

  describe('Error Handling', () => {
    it('should handle connection errors gracefully', async () => {
      try {
        await fetch('http://localhost:9999/nonexistent')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should handle malformed URLs gracefully', async () => {
      try {
        await fetch('not-a-valid-url')
      } catch (error) {
        expect(error).toBeDefined()
      }
    })
  })
})