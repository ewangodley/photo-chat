import { rest } from 'msw'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          }
        }
      })
    )
  }),

  rest.post(`${API_BASE}/auth/register`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          token: 'mock-jwt-token',
          user: {
            id: '2',
            username: 'newuser',
            email: 'new@example.com',
            role: 'user'
          }
        }
      })
    )
  }),

  rest.post(`${API_BASE}/auth/logout`, (req, res, ctx) => {
    return res(ctx.json({ success: true }))
  }),

  // User endpoints
  rest.get(`${API_BASE}/users/profile`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          profilePicture: null
        }
      })
    )
  }),

  rest.put(`${API_BASE}/users/profile`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: '1',
          username: 'updateduser',
          email: 'updated@example.com'
        }
      })
    )
  }),

  // Photo endpoints
  rest.get(`${API_BASE}/photos`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          photos: [
            {
              id: '1',
              url: 'https://example.com/photo1.jpg',
              caption: 'Test photo 1',
              location: { lat: 40.7128, lng: -74.0060 },
              createdAt: '2024-01-01T00:00:00Z'
            }
          ],
          pagination: { page: 1, limit: 20, total: 1 }
        }
      })
    )
  }),

  rest.post(`${API_BASE}/photos/upload`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          id: '2',
          url: 'https://example.com/photo2.jpg',
          caption: 'New photo',
          location: { lat: 40.7128, lng: -74.0060 }
        }
      })
    )
  }),

  // Chat endpoints
  rest.get(`${API_BASE}/chat/rooms`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: [
          {
            id: '1',
            name: 'General Chat',
            lastMessage: 'Hello world',
            lastMessageAt: '2024-01-01T00:00:00Z'
          }
        ]
      })
    )
  }),

  // Admin endpoints
  rest.get(`${API_BASE}/admin/users`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          users: [
            {
              id: '1',
              username: 'testuser',
              email: 'test@example.com',
              role: 'user',
              status: 'active'
            }
          ],
          pagination: { page: 1, limit: 20, total: 1 }
        }
      })
    )
  }),

  rest.get(`${API_BASE}/admin/analytics`, (req, res, ctx) => {
    return res(
      ctx.json({
        success: true,
        data: {
          totalUsers: 100,
          activeUsers: 80,
          totalPhotos: 500,
          totalMessages: 1000
        }
      })
    )
  })
]