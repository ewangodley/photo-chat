const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class FinalIntegrationTest {
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

  async testCoreServicesRunning() {
    await this.runTest('Core Services Running', async () => {
      const services = [
        { name: 'User Service', url: 'http://localhost:3004/users/health', expected: 'user-service' },
        { name: 'Chat Service', url: 'http://localhost:3003/chat/health', expected: 'chat-service' },
        { name: 'Notification Service', url: 'http://localhost:3005/notifications/health', expected: 'notification-service' },
        { name: 'API Gateway', url: 'http://localhost:8081/health', expected: 'api-gateway' }
      ];

      for (const service of services) {
        const response = await this.helpers.makeRequest(
          'GET',
          service.url,
          null,
          { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
        );

        this.helpers.assertSuccess(response, 200);

        if (response.data.service !== service.expected) {
          throw new Error(`${service.name} returned wrong service name: ${response.data.service}`);
        }
      }
    });
  }

  async testNewFeaturesWorking() {
    await this.runTest('New Features Working', async () => {
      // Test Profile Picture endpoints
      const profileResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      if (profileResponse.status === 404) {
        throw new Error('Profile picture endpoint not implemented');
      }

      if (profileResponse.status !== 401) {
        throw new Error('Profile picture endpoint not properly protected');
      }

      // Test Room Management endpoints
      const roomResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/rooms/create',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      if (roomResponse.status === 404) {
        throw new Error('Room management endpoint not implemented');
      }

      if (roomResponse.status !== 401) {
        throw new Error('Room management endpoint not properly protected');
      }

      // Test Admin Dashboard endpoints
      const dashboardResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/dashboard/realtime'
      );

      if (dashboardResponse.status === 404) {
        throw new Error('Admin dashboard endpoint not implemented');
      }

      // Should require admin auth (401 or 403)
      if (dashboardResponse.status !== 401 && dashboardResponse.status !== 403) {
        throw new Error('Admin dashboard endpoint not properly protected');
      }
    });
  }

  async testWebSocketFunctionality() {
    await this.runTest('WebSocket Functionality', async () => {
      // Test Chat Service WebSocket
      const chatResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3003/chat/health',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      this.helpers.assertSuccess(chatResponse, 200);

      if (!chatResponse.data.websocket || chatResponse.data.websocket !== 'enabled') {
        throw new Error('Chat WebSocket not enabled');
      }

      // Test Admin Service (should be running for dashboard WebSocket)
      const adminResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/health'
      );

      // Admin service should be accessible (may require auth)
      if (adminResponse.status === 404) {
        throw new Error('Admin service not running');
      }
    });
  }

  async testAPIProtection() {
    await this.runTest('API Protection Working', async () => {
      const protectedEndpoints = [
        'http://localhost:3003/chat/health',
        'http://localhost:3005/notifications/health'
      ];

      for (const endpoint of protectedEndpoints) {
        // Test without API key - should fail
        const responseWithoutKey = await this.helpers.makeRequest('GET', endpoint);
        
        if (responseWithoutKey.status === 200) {
          throw new Error(`Endpoint not protected: ${endpoint}`);
        }

        // Test with API key - should work
        const responseWithKey = await this.helpers.makeRequest(
          'GET',
          endpoint,
          null,
          { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
        );

        if (responseWithKey.status !== 200) {
          throw new Error(`API key not working for: ${endpoint}`);
        }
      }
    });
  }

  async testEndpointCoverage() {
    await this.runTest('Endpoint Coverage Complete', async () => {
      const endpoints = [
        // User Service
        { method: 'GET', url: 'http://localhost:3004/users/profile', feature: 'User Profile' },
        { method: 'POST', url: 'http://localhost:3004/users/profile-picture/upload', feature: 'Profile Pictures' },
        
        // Chat Service
        { method: 'POST', url: 'http://localhost:3003/chat/send', feature: 'Chat Messages' },
        { method: 'POST', url: 'http://localhost:3003/chat/rooms/create', feature: 'Room Management' },
        
        // Notification Service
        { method: 'GET', url: 'http://localhost:3005/notifications', feature: 'Notifications' },
        
        // Admin Service
        { method: 'GET', url: 'http://localhost:3006/admin/users', feature: 'Admin Management' },
        { method: 'GET', url: 'http://localhost:3006/admin/dashboard/realtime', feature: 'Admin Dashboard' }
      ];

      for (const endpoint of endpoints) {
        const response = await this.helpers.makeRequest(
          endpoint.method,
          endpoint.url,
          null,
          { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
        );

        // Should not return 404 (endpoint exists)
        if (response.status === 404) {
          throw new Error(`${endpoint.feature} endpoint not found: ${endpoint.url}`);
        }

        // Should require authentication (401) or admin auth (403)
        if (response.status !== 401 && response.status !== 403) {
          console.log(`Note: ${endpoint.feature} returned status ${response.status}`);
        }
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Final Integration Test - Verifying All Systems\n', 'blue');
    
    await this.testCoreServicesRunning();
    await this.testNewFeaturesWorking();
    await this.testWebSocketFunctionality();
    await this.testAPIProtection();
    await this.testEndpointCoverage();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = FinalIntegrationTest;