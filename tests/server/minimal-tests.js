const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class MinimalTests {
  constructor() {
    this.helpers = new TestHelpers(config);
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

  async testHealthChecks() {
    await this.runTest('Auth Service Health', async () => {
      const response = await this.helpers.makeRequest('GET', 'http://localhost:3001/auth/health');
      this.helpers.assertSuccess(response, 200);
    });

    await this.runTest('Photo Service Health', async () => {
      const response = await this.helpers.makeRequest('GET', 'http://localhost:3002/photos/health');
      this.helpers.assertSuccess(response, 200);
    });

    await this.runTest('Gateway Health', async () => {
      const response = await this.helpers.makeRequest('GET', 'http://localhost:8081/health');
      this.helpers.assertSuccess(response, 200);
    });
  }

  async testBasicAuth() {
    const timestamp = Date.now();
    
    await this.runTest('User Registration', async () => {
      const userData = {
        username: 'minimal_test_' + timestamp,
        email: 'minimal_test_' + timestamp + '@example.com',
        password: 'Password123'
      };
      const response = await this.helpers.registerUser(userData);
      this.helpers.assertSuccess(response, 201);
    });

    await this.runTest('Invalid Login', async () => {
      const response = await this.helpers.makeRequest('POST', 'http://localhost:3001/auth/login', {
        identifier: 'nonexistent_' + timestamp,
        password: 'WrongPassword'
      });
      this.helpers.assertError(response, 401, 'INVALID_CREDENTIALS');
    });
  }

  async testErrorHandling() {
    await this.runTest('Gateway 404', async () => {
      const response = await this.helpers.makeRequest('GET', 'http://localhost:8081/nonexistent');
      this.helpers.assertError(response, 404);
    });

    await this.runTest('Auth Validation', async () => {
      const response = await this.helpers.makeRequest('POST', 'http://localhost:3001/auth/register', {
        username: 'ab',
        email: 'invalid',
        password: 'weak'
      });
      this.helpers.assertError(response, 400, 'VALIDATION_ERROR');
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Running Minimal Test Suite', 'blue');
    
    await this.testHealthChecks();
    await this.testBasicAuth();
    await this.testErrorHandling();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = MinimalTests;