const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class IntegrationTests {
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

  async testAllServicesHealth() {
    await this.runTest('All Services Health Check', async () => {
      const services = [
        { name: 'User Service', url: 'http://localhost:3004/users/health' },
        { name: 'Chat Service', url: 'http://localhost:3003/chat/health' },
        { name: 'Admin Service', url: 'http://localhost:3006/health' },
        { name: 'Notification Service', url: 'http://localhost:3005/notifications/health' },
        { name: 'API Gateway', url: 'http://localhost:8081/health' }
      ];

      const results = [];
      for (const service of services) {
        try {
          const response = await this.helpers.makeRequest(
            'GET',
            service.url,
            null,
            { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
          );
          
          if (response.status === 200) {
            results.push(`✅ ${service.name}: Healthy`);
          } else {
            results.push(`❌ ${service.name}: Status ${response.status}`);
          }
        } catch (error) {
          results.push(`❌ ${service.name}: ${error.message}`);
        }
      }

      console.log('\nService Health Status:');
      results.forEach(result => console.log(result));

      const healthyServices = results.filter(r => r.includes('✅')).length;
      if (healthyServices < 4) {
        throw new Error(`Only ${healthyServices}/5 services are healthy`);
      }
    });
  }

  async testAuthenticationEndpoints() {
    await this.runTest('Authentication Endpoints Protection', async () => {
      const protectedEndpoints = [
        { method: 'GET', url: 'http://localhost:3004/users/profile' },
        { method: 'POST', url: 'http://localhost:3003/chat/rooms/create' },
        { method: 'POST', url: 'http://localhost:3004/users/profile-picture/upload' },
        { method: 'GET', url: 'http://localhost:3005/notifications' }
      ];

      for (const endpoint of protectedEndpoints) {
        const response = await this.helpers.makeRequest(
          endpoint.method,
          endpoint.url,
          null,
          { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
        );

        // Should return 401 (auth required) not 404 (not found)
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${endpoint.method} ${endpoint.url}`);
        }

        if (response.status !== 401) {
          throw new Error(`Expected 401 for ${endpoint.url}, got ${response.status}`);
        }
      }
    });
  }

  async testAPIKeyProtection() {
    await this.runTest('API Key Protection', async () => {
      const endpoints = [
        'http://localhost:3004/users/health',
        'http://localhost:3003/chat/health',
        'http://localhost:3005/notifications/health'
      ];

      for (const endpoint of endpoints) {
        // Test without API key
        const responseWithoutKey = await this.helpers.makeRequest('GET', endpoint);
        
        if (responseWithoutKey.status !== 401 && responseWithoutKey.status !== 403) {
          throw new Error(`API key not required for ${endpoint}`);
        }

        // Test with API key
        const responseWithKey = await this.helpers.makeRequest(
          'GET',
          endpoint,
          null,
          { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
        );

        if (responseWithKey.status !== 200) {
          throw new Error(`API key not working for ${endpoint}`);
        }
      }
    });
  }

  async testNewFeaturesIntegration() {
    await this.runTest('New Features Integration', async () => {
      // Test profile picture endpoints exist
      const profilePictureResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      if (profilePictureResponse.status === 404) {
        throw new Error('Profile picture upload endpoint not found');
      }

      // Test room management endpoints exist
      const roomCreateResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/rooms/create',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      if (roomCreateResponse.status === 404) {
        throw new Error('Room creation endpoint not found');
      }

      // Test admin dashboard endpoints exist
      const dashboardResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/realtime',
        null,
        { 'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production' }
      );

      if (dashboardResponse.status === 404) {
        throw new Error('Admin dashboard endpoint not found');
      }
    });
  }

  async testWebSocketConnections() {
    await this.runTest('WebSocket Connections Available', async () => {
      // Test chat service WebSocket info
      const chatHealthResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3003/chat/health',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      this.helpers.assertSuccess(chatHealthResponse, 200);

      if (!chatHealthResponse.data.websocket || chatHealthResponse.data.websocket !== 'enabled') {
        throw new Error('WebSocket not enabled in chat service');
      }

      // Test admin service WebSocket (should be running)
      const adminHealthResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/health',
        null,
        { 'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production' }
      );

      // Admin service should be running (may require different auth)
      if (adminHealthResponse.status === 404) {
        throw new Error('Admin service not accessible');
      }
    });
  }

  async testDatabaseConnections() {
    await this.runTest('Database Connections', async () => {
      const services = [
        { name: 'User Service', url: 'http://localhost:3004/users/health' },
        { name: 'Chat Service', url: 'http://localhost:3003/chat/health' },
        { name: 'Notification Service', url: 'http://localhost:3005/notifications/health' }
      ];

      for (const service of services) {
        const response = await this.helpers.makeRequest(
          'GET',
          service.url,
          null,
          { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
        );

        this.helpers.assertSuccess(response, 200);

        if (!response.data.service) {
          throw new Error(`${service.name} health check missing service info`);
        }
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Integration Tests\n', 'blue');
    
    await this.testAllServicesHealth();
    await this.testAuthenticationEndpoints();
    await this.testAPIKeyProtection();
    await this.testNewFeaturesIntegration();
    await this.testWebSocketConnections();
    await this.testDatabaseConnections();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = IntegrationTests;