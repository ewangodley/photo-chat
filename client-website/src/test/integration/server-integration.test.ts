/**
 * Integration Tests with Live Server
 * These tests require the full microservices stack to be running
 * Run: docker-compose up -d (from project root) before running these tests
 */

const SERVER_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

// Test data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'TestPassword123!'
}

describe('Server Integration Tests', () => {
  let authToken: string
  let userId: string

  beforeAll(async () => {
    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 2000))
  })

  describe('Authentication Service', () => {
    it('should register a new user', async () => {
      const response = await fetch(`${SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'phone-app-api-key-change-in-production'
        },
        body: JSON.stringify(testUser)
      })

      const data = await response.json()
      
      console.log('Registration response:', response.status, data)
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data.token).toBeDefined()
      expect(data.data.user.email).toBe(testUser.email)
      
      authToken = data.data.token
      userId = data.data.user.id
    })

    it('should login with valid credentials', async () => {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
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
      expect(data.data.token).toBeDefined()
    })

    it('should reject invalid credentials', async () => {
      const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': 'phone-app-api-key-change-in-production'
        },
        body: JSON.stringify({
          email: testUser.email,
          password: 'wrongpassword'
        })
      })

      expect(response.ok).toBe(false)
      expect(response.status).toBe(401)
    })
  })

  describe('User Service', () => {
    it('should get user profile', async () => {
      const response = await fetch(`${SERVER_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': 'phone-app-api-key-change-in-production'
        }
      })

      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data.email).toBe(testUser.email)
    })

    it('should update user profile', async () => {
      const updateData = { username: `updated_${testUser.username}` }
      
      const response = await fetch(`${SERVER_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': 'phone-app-api-key-change-in-production'
        },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data.username).toBe(updateData.username)
    })
  })

  describe('Photo Service', () => {
    let photoId: string

    it('should upload a photo', async () => {
      const formData = new FormData()
      const blob = new Blob(['fake image data'], { type: 'image/jpeg' })
      formData.append('photo', blob, 'test.jpg')
      formData.append('caption', 'Test photo from integration test')
      formData.append('latitude', '40.7128')
      formData.append('longitude', '-74.0060')

      const response = await fetch(`${SERVER_URL}/photos/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': 'phone-app-api-key-change-in-production'
        },
        body: formData
      })

      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(data.data.caption).toBe('Test photo from integration test')
      
      photoId = data.data.id
    })

    it('should get photos list', async () => {
      const response = await fetch(`${SERVER_URL}/photos?page=1&limit=10`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': 'phone-app-api-key-change-in-production'
        }
      })

      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data.photos)).toBe(true)
    })

    it('should delete uploaded photo', async () => {
      if (!photoId) return

      const response = await fetch(`${SERVER_URL}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': 'phone-app-api-key-change-in-production'
        }
      })

      expect(response.ok).toBe(true)
    })
  })

  describe('Chat Service', () => {
    it('should get chat rooms', async () => {
      const response = await fetch(`${SERVER_URL}/chat/rooms`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': 'phone-app-api-key-change-in-production'
        }
      })

      const data = await response.json()
      
      expect(response.ok).toBe(true)
      expect(data.success).toBe(true)
      expect(Array.isArray(data.data)).toBe(true)
    })
  })

  describe('Admin Service (if admin user)', () => {
    it('should handle admin endpoints appropriately', async () => {
      const response = await fetch(`${SERVER_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': 'phone-app-api-key-change-in-production'
        }
      })

      // Should either succeed (if admin) or return 403 (if not admin)
      expect([200, 403]).toContain(response.status)
    })
  })

  afterAll(async () => {
    // Cleanup: logout
    if (authToken) {
      await fetch(`${SERVER_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'X-API-Key': 'phone-app-api-key-change-in-production'
        }
      })
    }
  })
})