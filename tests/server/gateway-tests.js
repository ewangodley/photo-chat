const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class GatewayTests {
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
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async testHealthCheck() {
    await this.runTest('Gateway Health Check', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.gateway.baseUrl + config.services.gateway.endpoints.health
      );
      this.helpers.assertSuccess(response, 200);
      if (!response.data || response.data.service !== 'api-gateway') {
        throw new Error(`Invalid service identifier in health check: ${JSON.stringify(response.data)}`);
      }
    });
  }

  async testApiDocumentation() {
    await this.runTest('Gateway API Documentation', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.gateway.baseUrl + config.services.gateway.endpoints.api
      );
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data) {
        throw new Error('Missing response data in API documentation');
      }
      
      const { name, services } = response.data;
      if (!name || !services) {
        throw new Error('Missing required fields in API documentation');
      }
      if (!services.auth || !services.photos) {
        throw new Error('Missing service endpoints in documentation');
      }
    });
  }

  async testRateLimiting() {
    await this.runTest('Gateway Rate Limiting', async () => {
      const requests = [];
      
      // Make multiple rapid requests to test rate limiting
      for (let i = 0; i < 5; i++) {
        requests.push(
          this.helpers.makeRequest(
            'GET',
            config.services.gateway.baseUrl + config.services.gateway.endpoints.health
          )
        );
      }

      const responses = await Promise.all(requests);
      
      // All should succeed as health check has high limits
      responses.forEach(response => {
        if (!response.success) {
          throw new Error('Rate limiting too aggressive for health checks');
        }
      });
    });
  }

  async test404Handling() {
    await this.runTest('Gateway 404 Handling', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.gateway.baseUrl + '/nonexistent-endpoint'
      );
      this.helpers.assertError(response, 404, 'NOT_FOUND');
    });
  }

  async testCorsHeaders() {
    await this.runTest('Gateway CORS Headers', async () => {
      const response = await this.helpers.makeRequest(
        'OPTIONS',
        config.services.gateway.baseUrl + config.services.gateway.endpoints.health
      );
      
      // OPTIONS request should be handled
      if (response.status !== 200 && response.status !== 204) {
        throw new Error('CORS preflight request not handled properly');
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Gateway Tests', 'blue');
    
    await this.testHealthCheck();
    await this.testApiDocumentation();
    await this.testRateLimiting();
    await this.test404Handling();
    await this.testCorsHeaders();

    return this.testResults;
  }
}

module.exports = GatewayTests;