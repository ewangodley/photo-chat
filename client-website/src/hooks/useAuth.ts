import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/lib/api/services/auth'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'

export const useAuth = () => {
  const { user, token, isAuthenticated, login: setLogin, logout: setLogout } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Client-side only initialization
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password })
      if (response.success && response.data) {
        setLogin(response.data.user, response.data.tokens.accessToken)
        return { success: true }
      }
      return { success: false, error: response.error?.message || 'Login failed' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }, [setLogin])

  const logout = useCallback(() => {
    setLogout()
    router.push('/auth/login')
  }, [setLogout, router])

  const register = useCallback(async (username: string, email: string, password: string) => {
    try {
      const response = await authApi.register({ username, email, password })
      if (response.success && response.data) {
        setLogin(response.data.user, response.data.tokens.accessToken)
        return { success: true }
      }
      return { success: false, error: response.error?.message || 'Registration failed' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }, [setLogin])

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    register
  }
}