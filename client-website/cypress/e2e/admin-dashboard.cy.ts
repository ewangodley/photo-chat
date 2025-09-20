describe('Admin Dashboard', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    
    // Mock admin login
    cy.mockApiResponse('POST', '**/auth/login', {
      success: true,
      data: {
        token: 'admin-token',
        user: {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          role: 'admin'
        }
      }
    })

    // Mock admin analytics
    cy.mockApiResponse('GET', '**/admin/analytics', {
      success: true,
      data: {
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
    })

    cy.login('admin@example.com', 'password123')
  })

  describe('Dashboard Overview', () => {
    it('should display analytics dashboard', () => {
      cy.visit('/admin/dashboard')
      
      cy.get('[data-testid="total-users-card"]').should('contain', '150')
      cy.get('[data-testid="active-users-card"]').should('contain', '120')
      cy.get('[data-testid="total-photos-card"]').should('contain', '500')
      cy.get('[data-testid="total-messages-card"]').should('contain', '1000')
    })

    it('should display user growth chart', () => {
      cy.visit('/admin/analytics')
      
      cy.get('[data-testid="user-growth-chart"]').should('be.visible')
      cy.get('canvas').should('exist')
    })
  })

  describe('User Management', () => {
    beforeEach(() => {
      cy.mockApiResponse('GET', '**/admin/users*', {
        success: true,
        data: {
          users: [
            {
              id: '1',
              username: 'testuser1',
              email: 'test1@example.com',
              role: 'user',
              status: 'active',
              createdAt: '2024-01-01T00:00:00Z'
            },
            {
              id: '2',
              username: 'testuser2',
              email: 'test2@example.com',
              role: 'user',
              status: 'suspended',
              createdAt: '2024-01-02T00:00:00Z'
            }
          ],
          pagination: { page: 1, limit: 20, total: 2 }
        }
      })
    })

    it('should display users list', () => {
      cy.visit('/admin/users')
      
      cy.get('[data-testid="users-table"]').should('be.visible')
      cy.get('[data-testid="user-row-1"]').should('contain', 'testuser1')
      cy.get('[data-testid="user-row-2"]').should('contain', 'testuser2')
    })

    it('should filter users by status', () => {
      cy.visit('/admin/users')
      
      cy.get('[data-testid="status-filter"]').select('suspended')
      cy.get('[data-testid="user-row-1"]').should('not.exist')
      cy.get('[data-testid="user-row-2"]').should('be.visible')
    })

    it('should update user status', () => {
      cy.mockApiResponse('PUT', '**/admin/users/1/status', {
        success: true,
        data: { id: '1', status: 'suspended' }
      })

      cy.visit('/admin/users')
      
      cy.get('[data-testid="user-actions-1"]').click()
      cy.get('[data-testid="suspend-user-1"]').click()
      cy.get('[data-testid="confirm-suspend"]').click()
      
      cy.get('[data-testid="success-message"]').should('contain', 'User status updated')
    })
  })

  describe('Content Moderation', () => {
    beforeEach(() => {
      cy.mockApiResponse('GET', '**/admin/photos*', {
        success: true,
        data: {
          photos: [
            {
              id: '1',
              url: 'https://example.com/photo1.jpg',
              caption: 'Test photo 1',
              status: 'pending',
              userId: 'user1',
              createdAt: '2024-01-01T00:00:00Z'
            }
          ],
          pagination: { page: 1, limit: 20, total: 1 }
        }
      })
    })

    it('should display photos for moderation', () => {
      cy.visit('/admin/moderation')
      
      cy.get('[data-testid="moderation-queue"]').should('be.visible')
      cy.get('[data-testid="photo-1"]').should('be.visible')
    })

    it('should approve photo', () => {
      cy.mockApiResponse('PUT', '**/admin/photos/1/moderate', {
        success: true,
        data: { id: '1', status: 'approved' }
      })

      cy.visit('/admin/moderation')
      
      cy.get('[data-testid="approve-photo-1"]').click()
      cy.get('[data-testid="success-message"]').should('contain', 'Photo approved')
    })

    it('should reject photo', () => {
      cy.mockApiResponse('PUT', '**/admin/photos/1/moderate', {
        success: true,
        data: { id: '1', status: 'rejected' }
      })

      cy.visit('/admin/moderation')
      
      cy.get('[data-testid="reject-photo-1"]').click()
      cy.get('[data-testid="rejection-reason"]').type('Inappropriate content')
      cy.get('[data-testid="confirm-reject"]').click()
      
      cy.get('[data-testid="success-message"]').should('contain', 'Photo rejected')
    })
  })

  describe('System Monitoring', () => {
    beforeEach(() => {
      cy.mockApiResponse('GET', '**/admin/system/health', {
        success: true,
        data: {
          services: [
            { name: 'auth-service', status: 'healthy', uptime: '99.9%' },
            { name: 'photo-service', status: 'healthy', uptime: '99.8%' },
            { name: 'chat-service', status: 'degraded', uptime: '95.2%' }
          ],
          metrics: {
            cpu: 45,
            memory: 67,
            disk: 23
          }
        }
      })
    })

    it('should display system health status', () => {
      cy.visit('/admin/monitoring')
      
      cy.get('[data-testid="service-auth-service"]').should('contain', 'healthy')
      cy.get('[data-testid="service-photo-service"]').should('contain', 'healthy')
      cy.get('[data-testid="service-chat-service"]').should('contain', 'degraded')
    })

    it('should display system metrics', () => {
      cy.visit('/admin/monitoring')
      
      cy.get('[data-testid="cpu-usage"]').should('contain', '45%')
      cy.get('[data-testid="memory-usage"]').should('contain', '67%')
      cy.get('[data-testid="disk-usage"]').should('contain', '23%')
    })
  })

  describe('Access Control', () => {
    it('should deny access to non-admin users', () => {
      cy.clearLocalStorage()
      
      // Mock regular user login
      cy.mockApiResponse('POST', '**/auth/login', {
        success: true,
        data: {
          token: 'user-token',
          user: {
            id: '2',
            username: 'regularuser',
            email: 'user@example.com',
            role: 'user'
          }
        }
      })

      cy.login('user@example.com', 'password123')
      cy.visit('/admin/dashboard')
      
      cy.get('[data-testid="access-denied"]').should('be.visible')
      cy.get('[data-testid="access-denied"]').should('contain', 'Access Denied')
    })
  })
})