const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class SecurityTests {
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
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async testAuthServiceWithoutApiKey() {
    await this.runTest('Auth Service - No API Key', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/auth/health',
        null,
        { 'X-API-Key': '' } // Override with empty API key
      );
      
      this.helpers.assertError(response, 401, 'INVALID_API_KEY');
    });
  }

  async testPhotoServiceWithoutApiKey() {
    await this.runTest('Photo Service - No API Key', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3002/photos/health',
        null,
        { 'X-API-Key': '' } // Override with empty API key
      );
      
      this.helpers.assertError(response, 401, 'INVALID_API_KEY');
    });
  }

  async testInvalidApiKey() {
    await this.runTest('Invalid API Key', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/auth/health',
        null,
        { 'X-API-Key': 'invalid-key' }
      );
      
      this.helpers.assertError(response, 401, 'INVALID_API_KEY');
    });
  }

  async testValidApiKey() {
    await this.runTest('Valid API Key', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3001/auth/health',
        null,
        { 'X-API-Key': process.env.API_KEY || 'phone-app-api-key-change-in-production' }
      );
      
      this.helpers.assertSuccess(response, 200);
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Security Tests\n', 'blue');
    
    await this.testAuthServiceWithoutApiKey();
    await this.testPhotoServiceWithoutApiKey();
    await this.testInvalidApiKey();
    await this.testValidApiKey();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = SecurityTests;