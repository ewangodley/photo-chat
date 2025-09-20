const TestHelpers = require('../utils/test-helpers');
const RateLimitHandler = require('../utils/rate-limit-handler');
const config = require('../utils/test-config');

class ProductionReadyTests {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.rateLimiter = new RateLimitHandler();
    this.testResults = [];
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
  }

  async testCoreServices() {
    await this.runTest('Service Health Checks', async () => {
      const services = [
        { name: 'Auth', url: 'http://localhost:3001/auth/health' },
        { name: 'Photo', url: 'http://localhost:3002/photos/health' },
        { name: 'Gateway', url: 'http://localhost:8081/health' }
      ];

      for (const service of services) {
        const response = await this.helpers.makeRequest('GET', service.url);
        this.helpers.assertSuccess(response, 200);
        this.helpers.log(`✓ ${service.name} service healthy`, 'green');
      }
    });
  }

  async testAuthenticationFlow() {
    const timestamp = Date.now();
    let testUser = null;

    await this.runTest('User Registration Flow', async () => {
      await this.rateLimiter.waitForRateLimit();
      
      const userData = {
        username: 'prod_test_' + timestamp,
        email: 'prod_test_' + timestamp + '@example.com',
        password: 'Password123'
      };

      const response = await this.rateLimiter.handleRateLimitedRequest(async () => {
        return await this.helpers.registerUser(userData);
      });

      this.helpers.assertSuccess(response, 201);
      testUser = userData;
      
      const { user, tokens } = response.data.data;
      if (!user.id || !tokens.accessToken) {
        throw new Error('Missing required fields in registration');
      }
    });

    await this.runTest('User Login Flow', async () => {
      if (!testUser) {
        throw new Error('No test user available from registration');
      }

      await this.rateLimiter.waitForRateLimit();
      
      const response = await this.rateLimiter.handleRateLimitedRequest(async () => {
        return await this.helpers.loginUser(testUser.username, testUser.password);
      });

      this.helpers.assertSuccess(response, 200);
      
      const { user, tokens } = response.data.data;
      if (!user.id || !tokens.accessToken) {
        throw new Error('Missing required fields in login');
      }
    });
  }

  async testInputValidation() {
    await this.runTest('Input Validation', async () => {
      const validationTests = [
        {
          name: 'Invalid Username',
          data: { username: 'ab', email: 'test@example.com', password: 'Password123' }
        },
        {
          name: 'Invalid Email', 
          data: { username: 'testuser', email: 'invalid-email', password: 'Password123' }
        },
        {
          name: 'Weak Password',
          data: { username: 'testuser', email: 'test@example.com', password: 'weak' }
        }
      ];

      for (const test of validationTests) {
        await this.rateLimiter.waitForRateLimit();
        
        const response = await this.helpers.makeRequest(
          'POST', 
          'http://localhost:3001/auth/register', 
          test.data
        );
        
        if (response.status === 429) {
          this.helpers.logWarning(`Rate limited during ${test.name} - skipping`);
          continue;
        }
        
        this.helpers.assertError(response, 400, 'VALIDATION_ERROR');
        this.helpers.log(`✓ ${test.name} validation working`, 'green');
      }
    });
  }

  async testErrorHandling() {
    await this.runTest('Error Handling', async () => {
      // Test 404 handling
      const notFoundResponse = await this.helpers.makeRequest('GET', 'http://localhost:8081/nonexistent');
      this.helpers.assertError(notFoundResponse, 404);
      
      // Test invalid credentials
      const invalidLoginResponse = await this.helpers.makeRequest('POST', 'http://localhost:3001/auth/login', {
        identifier: 'nonexistent_user_' + Date.now(),
        password: 'WrongPassword'
      });
      this.helpers.assertError(invalidLoginResponse, 401, 'INVALID_CREDENTIALS');
      
      this.helpers.log('✓ Error handling working correctly', 'green');
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Production-Ready Test Suite', 'blue');
    this.helpers.log('Testing core functionality with rate limit handling\n', 'cyan');
    
    await this.testCoreServices();
    await this.testAuthenticationFlow();
    await this.testInputValidation();
    await this.testErrorHandling();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = ProductionReadyTests;