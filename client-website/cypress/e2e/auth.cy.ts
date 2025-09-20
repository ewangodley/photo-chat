describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
  })

  describe('User Registration', () => {
    it('should complete registration successfully', () => {
      cy.mockApiResponse('POST', '**/auth/register', {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          }
        }
      })

      cy.visit('/auth/register')
      
      cy.get('[data-testid="username-input"]').type('testuser')
      cy.get('[data-testid="email-input"]').type('test@example.com')
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('password123')
      
      cy.get('[data-testid="register-button"]').click()
      
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="welcome-message"]').should('be.visible')
    })

    it('should show validation errors for invalid input', () => {
      cy.visit('/auth/register')
      
      cy.get('[data-testid="email-input"]').type('invalid-email')
      cy.get('[data-testid="password-input"]').type('123')
      cy.get('[data-testid="register-button"]').click()
      
      cy.get('[data-testid="email-error"]').should('contain', 'Invalid email')
      cy.get('[data-testid="password-error"]').should('contain', 'Password must be at least 8 characters')
    })

    it('should show error for mismatched passwords', () => {
      cy.visit('/auth/register')
      
      cy.get('[data-testid="password-input"]').type('password123')
      cy.get('[data-testid="confirm-password-input"]').type('different123')
      cy.get('[data-testid="register-button"]').click()
      
      cy.get('[data-testid="confirm-password-error"]').should('contain', 'Passwords do not match')
    })
  })

  describe('User Login', () => {
    it('should login successfully with valid credentials', () => {
      cy.mockApiResponse('POST', '**/auth/login', {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          }
        }
      })

      cy.login('test@example.com', 'password123')
      
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="user-avatar"]').should('be.visible')
    })

    it('should show error for invalid credentials', () => {
      cy.mockApiResponse('POST', '**/auth/login', {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      })

      cy.visit('/auth/login')
      cy.get('[data-testid="email-input"]').type('wrong@example.com')
      cy.get('[data-testid="password-input"]').type('wrongpassword')
      cy.get('[data-testid="login-button"]').click()
      
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid email or password')
    })

    it('should redirect to login when accessing protected route', () => {
      cy.visit('/dashboard')
      cy.url().should('include', '/auth/login')
    })
  })

  describe('User Logout', () => {
    it('should logout successfully', () => {
      // First login
      cy.mockApiResponse('POST', '**/auth/login', {
        success: true,
        data: {
          token: 'test-token',
          user: {
            id: '1',
            username: 'testuser',
            email: 'test@example.com',
            role: 'user'
          }
        }
      })

      cy.login('test@example.com', 'password123')
      
      // Then logout
      cy.logout()
      
      cy.url().should('include', '/auth/login')
    })
  })
})