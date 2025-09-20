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
        config.services.gateway.baseUrl + '/api'
      );
      
      if (response.status !== 200) {
        throw new Error(`API documentation endpoint returned ${response.status}`);
      }
      
      if (!response.data) {
        throw new Error('Missing response data in API documentation');
      }
      
      // Check for basic structure
      if (typeof response.data !== 'object') {
        throw new Error('API documentation should return an object');
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
      
      if (response.status !== 200 && response.status !== 204) {
        throw new Error('CORS preflight request not handled properly');
      }
    });
  }

  async testServiceProxying() {
    await this.runTest('Gateway Service Proxying', async () => {
      // Test auth service proxy
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.gateway.baseUrl + '/api/auth/health'
      );
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data || response.data.service !== 'auth-service') {
        throw new Error('Auth service proxy not working correctly');
      }
    });
  }

  async testMultipleServiceProxies() {
    await this.runTest('Gateway Multiple Service Proxies', async () => {
      const services = [
        { path: '/api/auth/health', expectedService: 'auth-service' },
        { path: '/api/photos/health', expectedService: 'photo-service' }
      ];
      
      for (const service of services) {
        const response = await this.helpers.makeRequest(
          'GET',
          config.services.gateway.baseUrl + service.path
        );
        this.helpers.assertSuccess(response, 200);
        
        if (response.data.service !== service.expectedService) {
          throw new Error(`${service.expectedService} proxy not working`);
        }
      }
    });
  }

  async testServiceUnavailable() {
    await this.runTest('Gateway Service Unavailable Handling', async () => {
      // Test proxy to non-existent service endpoint
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.gateway.baseUrl + '/api/admin/health'
      );
      
      // Should return 503 or 404 depending on service availability
      if (response.status !== 503 && response.status !== 404) {
        // If admin service is running, that's also valid
        if (response.status === 200) {
          return; // Admin service is available
        }
        throw new Error('Expected 503 or 404 for unavailable service');
      }
    });
  }

  async testRequestSizeLimit() {
    await this.runTest('Gateway Request Size Limit', async () => {
      // Test with large payload (should be within 10mb limit)
      const largeData = { data: 'x'.repeat(1000) }; // 1KB payload
      
      const response = await this.helpers.makeRequest(
        'POST',
        config.services.gateway.baseUrl + '/api/auth/health',
        largeData
      );
      
      // Should handle the request (may return 404 for POST to health)
      if (response.status >= 500) {
        throw new Error('Gateway should handle reasonable request sizes');
      }
    });
  }

  async testInvalidJsonHandling() {
    await this.runTest('Gateway Invalid JSON Handling', async () => {
      try {
        const response = await this.helpers.makeRequest(
          'POST',
          config.services.gateway.baseUrl + '/api/auth/login',
          'invalid json string'
        );
        
        // Should handle invalid JSON gracefully
        if (response.status >= 500) {
          throw new Error('Gateway should handle invalid JSON gracefully');
        }
      } catch (error) {
        // Network errors are acceptable for malformed requests
        if (!error.message.includes('JSON')) {
          throw error;
        }
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Gateway Tests', 'blue');
    
    await this.testHealthCheck();
    await this.testApiDocumentation();
    await this.testServiceProxying();
    await this.testMultipleServiceProxies();
    await this.testRateLimiting();
    await this.test404Handling();
    await this.testCorsHeaders();
    await this.testServiceUnavailable();
    await this.testRequestSizeLimit();
    await this.testInvalidJsonHandling();

    return this.testResults;
  }
}

module.exports = GatewayTests;