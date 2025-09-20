const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class AuthTestsOptimized {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.testResults = [];
    this.sharedUser = null; // Reuse user across tests to avoid rate limiting
  }

  async runTest(testName, testFn) {
    this.helpers.logTest(testName);
    try {
      await testFn();
      this.helpers.logSuccess(`${testName} - PASSED`);
      this.testResults.push({ name: testName, status: 'PASSED' });
    } catch (error) {
      this.helpers.logError(`${testName} - FAILED: ${error.message}`);
      this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
    }
    // Add longer delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async setupSharedUser() {
    if (!this.sharedUser) {
      const timestamp = Date.now();
      const userData = {
        username: 'shared_test_' + timestamp,
        email: 'shared_test_' + timestamp + '@example.com',
        password: 'Password123'
      };
      const regResponse = await this.helpers.registerUser(userData);
      this.helpers.assertSuccess(regResponse, 201);
      this.sharedUser = userData;
    }
    return this.sharedUser;
  }

  async testHealthCheck() {
    await this.runTest('Auth Service Health Check', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.auth.baseUrl + config.services.auth.endpoints.health
      );
      this.helpers.assertSuccess(response, 200);
      if (!response.data || response.data.service !== 'auth-service') {
        throw new Error(`Invalid service identifier in health check: ${JSON.stringify(response.data)}`);
      }
    });
  }

  async testUserRegistration() {
    await this.runTest('User Registration - Valid Data', async () => {
      const timestamp = Date.now();
      const userData = {
        username: 'reg_test_' + timestamp,
        email: 'reg_test_' + timestamp + '@example.com',
        password: 'Password123'
      };
      const response = await this.helpers.registerUser(userData);
      this.helpers.assertSuccess(response, 201);
      
      const { user, tokens } = response.data.data;
      if (!user.id || !user.username || !tokens.accessToken) {
        throw new Error('Missing required fields in registration response');
      }
    });
  }

  async testUserRegistrationValidation() {
    await this.runTest('User Registration - Invalid Username', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        config.services.auth.baseUrl + config.services.auth.endpoints.register,
        {
          username: 'ab', // Too short
          email: 'test@example.com',
          password: 'Password123'
        }
      );
      this.helpers.assertError(response, 400, 'VALIDATION_ERROR');
    });

    await this.runTest('User Registration - Invalid Email', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        config.services.auth.baseUrl + config.services.auth.endpoints.register,
        {
          username: 'testuser',
          email: 'invalid-email',
          password: 'Password123'
        }
      );
      this.helpers.assertError(response, 400, 'VALIDATION_ERROR');
    });

    await this.runTest('User Registration - Weak Password', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        config.services.auth.baseUrl + config.services.auth.endpoints.register,
        {
          username: 'testuser',
          email: 'test@example.com',
          password: 'weak'
        }
      );
      this.helpers.assertError(response, 400, 'VALIDATION_ERROR');
    });
  }

  async testUserLogin() {
    await this.runTest('User Login - Valid Credentials', async () => {
      // Create fresh user for login test to avoid token conflicts
      const timestamp = Date.now();
      const userData = {
        username: 'login_fresh_' + timestamp,
        email: 'login_fresh_' + timestamp + '@example.com',
        password: 'Password123'
      };
      const regResponse = await this.helpers.registerUser(userData);
      this.helpers.assertSuccess(regResponse, 201);
      
      // Wait before login to avoid conflicts
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await this.helpers.loginUser(userData.username, userData.password);
      this.helpers.assertSuccess(response, 200);

      const { user: loginUser, tokens } = response.data.data;
      if (!loginUser.id || !tokens.accessToken) {
        throw new Error('Missing required fields in login response');
      }
    });
  }

  async testInvalidLogin() {
    await this.runTest('User Login - Invalid Credentials', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        config.services.auth.baseUrl + config.services.auth.endpoints.login,
        {
          identifier: 'nonexistent_user_' + Date.now(),
          password: 'WrongPassword123'
        }
      );
      this.helpers.assertError(response, 401, 'INVALID_CREDENTIALS');
    });
  }

  async testTokenVerification() {
    await this.runTest('Token Verification - Valid Token', async () => {
      const user = await this.setupSharedUser();
      const token = this.helpers.authTokens[user.username];
      
      if (!token) {
        throw new Error('No token available for shared user');
      }

      const response = await this.helpers.makeRequest(
        'POST',
        config.services.auth.baseUrl + config.services.auth.endpoints.verifyToken,
        { token }
      );
      this.helpers.assertSuccess(response, 200);

      const { valid, user: verifyUser } = response.data.data;
      if (!valid || !verifyUser.id) {
        throw new Error('Token verification failed');
      }
    });
  }

  async testInvalidTokenVerification() {
    await this.runTest('Token Verification - Invalid Token', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        config.services.auth.baseUrl + config.services.auth.endpoints.verifyToken,
        { token: 'invalid.jwt.token' }
      );
      this.helpers.assertError(response, 403, 'TOKEN_INVALID');
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Auth Service Tests (Optimized)', 'blue');
    
    await this.testHealthCheck();
    await this.testUserRegistration();
    await this.testUserRegistrationValidation();
    await this.testUserLogin();
    await this.testInvalidLogin();
    await this.testTokenVerification();
    await this.testInvalidTokenVerification();

    // Cleanup
    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = AuthTestsOptimized;