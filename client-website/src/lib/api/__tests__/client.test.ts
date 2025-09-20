import { apiClient } from '../client'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

// Mock fetch for unit tests only
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('ApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
    mockFetch.mockClear()
  })

  describe('GET requests', () => {
    it('should make successful GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} })
      })
      
      const response = await apiClient.get('/test')
      
      expect(response.success).toBe(true)
    })

    it('should include API key in headers', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiClient.get('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-API-Key': expect.any(String)
          })
        })
      )
    })

    it('should include authorization header when token exists', async () => {
      mockLocalStorage.getItem.mockReturnValue('test-token')
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      })

      await apiClient.get('/test')
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
    })
  })

  describe('POST requests', () => {
    it('should make successful POST request with body', async () => {
      const testData = { name: 'test' }
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: testData })
      })

      const response = await apiClient.post('/test', testData)
      
      expect(response.success).toBe(true)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testData)
        })
      )
    })
  })

  describe('Error handling', () => {
    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Invalid request' }
        })
      })

      const response = await apiClient.get('/error')
      
      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('BAD_REQUEST')
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const response = await apiClient.get('/network-error')
      
      expect(response.success).toBe(false)
      expect(response.error?.code).toBe('NETWORK_ERROR')
    })
  })
})