import { renderHook, act, waitFor } from '@testing-library/react'
import { useAuth } from '../useAuth'

// Mock the entire auth module
jest.mock('@/lib/auth/auth', () => ({
  AuthManager: {
    getUser: jest.fn(),
    isAuthenticated: jest.fn(),
    clearAuth: jest.fn(),
    setUser: jest.fn(),
  },
  authApi: {
    login: jest.fn(),
  },
}))

// Get mocked functions
const { AuthManager, authApi } = require('@/lib/auth/auth')

describe('useAuth Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should set loading to false after initialization', async () => {
    AuthManager.isAuthenticated.mockReturnValue(false)
    AuthManager.getUser.mockReturnValue(null)

    const { result } = renderHook(() => useAuth())
    
    // Wait for useEffect to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should set user when authenticated', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user' as const
    }

    AuthManager.isAuthenticated.mockReturnValue(true)
    AuthManager.getUser.mockReturnValue(mockUser)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.isLoading).toBe(false)
  })

  it('should handle successful login', async () => {
    const mockUser = {
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      role: 'user' as const
    }

    authApi.login.mockResolvedValue({ success: true })
    AuthManager.getUser.mockReturnValue(mockUser)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      const response = await result.current.login('test@example.com', 'password')
      expect(response.success).toBe(true)
    })
  })

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuth())

    act(() => {
      result.current.logout()
    })

    expect(AuthManager.clearAuth).toHaveBeenCalled()
  })
})