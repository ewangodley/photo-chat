// Mock data for testing

export const mockUser = {
  id: '1',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user' as const,
  profilePicture: null,
  createdAt: '2024-01-01T00:00:00Z'
}

export const mockAdminUser = {
  id: '2',
  username: 'admin',
  email: 'admin@example.com',
  role: 'admin' as const,
  profilePicture: null,
  createdAt: '2024-01-01T00:00:00Z'
}

export const mockPhoto = {
  id: '1',
  url: 'https://example.com/photo1.jpg',
  caption: 'Test photo',
  location: { lat: 40.7128, lng: -74.0060 },
  userId: '1',
  createdAt: '2024-01-01T00:00:00Z'
}

export const mockChatRoom = {
  id: '1',
  name: 'General Chat',
  lastMessage: 'Hello world',
  lastMessageAt: '2024-01-01T00:00:00Z',
  participants: [mockUser]
}

export const mockMessage = {
  id: '1',
  content: 'Hello world',
  userId: '1',
  roomId: '1',
  createdAt: '2024-01-01T00:00:00Z'
}

export const mockAnalytics = {
  totalUsers: 150,
  activeUsers: 120,
  totalPhotos: 500,
  totalMessages: 1000,
  userGrowth: [
    { date: '2024-01-01', users: 100 },
    { date: '2024-01-02', users: 120 },
    { date: '2024-01-03', users: 150 }
  ]
}