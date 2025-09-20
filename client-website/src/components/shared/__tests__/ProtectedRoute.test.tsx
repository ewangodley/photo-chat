import { render, screen, waitFor } from '@testing-library/react'
import { ProtectedRoute } from '../ProtectedRoute'

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

jest.mock('@/lib/auth/auth', () => ({
  AuthManager: {
    isAuthenticated: jest.fn(),
    hasRole: jest.fn(),
  },
}))

// Get mocked AuthManager
const { AuthManager } = require('@/lib/auth/auth')

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to login when not authenticated', async () => {
    AuthManager.isAuthenticated.mockReturnValue(false)

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('should render children when authenticated and authorized', async () => {
    AuthManager.isAuthenticated.mockReturnValue(true)
    AuthManager.hasRole.mockReturnValue(true)

    render(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('should show access denied when not authorized', async () => {
    AuthManager.isAuthenticated.mockReturnValue(true)
    AuthManager.hasRole.mockReturnValue(false)

    render(
      <ProtectedRoute requiredRole="admin">
        <div>Admin Content</div>
      </ProtectedRoute>
    )

    await waitFor(() => {
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })
  })
})