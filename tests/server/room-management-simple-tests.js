const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class RoomManagementSimpleTests {
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

  async testRoomEndpointsExist() {
    await this.runTest('Room Management Endpoints Exist', async () => {
      const endpoints = [
        { method: 'POST', path: '/chat/rooms/create' },
        { method: 'GET', path: '/chat/rooms' },
        { method: 'POST', path: '/chat/rooms/test/join' },
        { method: 'POST', path: '/chat/rooms/test/leave' },
        { method: 'POST', path: '/chat/rooms/test/participants' },
        { method: 'DELETE', path: '/chat/rooms/test/participants/user' }
      ];

      for (const endpoint of endpoints) {
        const response = await this.helpers.makeRequest(
          endpoint.method,
          `http://localhost:3003${endpoint.path}`,
          null,
          { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
        );

        // Should return 401 (auth required) not 404 (not found)
        if (response.status === 404) {
          throw new Error(`Endpoint not found: ${endpoint.method} ${endpoint.path}`);
        }

        if (response.status !== 401) {
          throw new Error(`Expected 401 for ${endpoint.path}, got ${response.status}`);
        }
      }
    });
  }

  async testRoomAuthenticationRequired() {
    await this.runTest('Room Authentication Required', async () => {
      // Test create room without auth
      const createResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/rooms/create',
        { name: 'Test Room' }
      );

      if (createResponse.status !== 401 && createResponse.status !== 403) {
        throw new Error(`Expected auth error for create room, got ${createResponse.status}`);
      }

      // Test get rooms without auth
      const getRoomsResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3003/chat/rooms'
      );

      if (getRoomsResponse.status !== 401 && getRoomsResponse.status !== 403) {
        throw new Error(`Expected auth error for get rooms, got ${getRoomsResponse.status}`);
      }
    });
  }

  async testRoomValidationLogic() {
    await this.runTest('Room Validation Logic', async () => {
      // Test create room with API key but no auth token
      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/rooms/create',
        { name: 'Test Room' },
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      // Should have proper error structure
      if (!response.data || !response.data.error) {
        throw new Error('Missing error structure in response');
      }

      if (!response.data.error.code || !response.data.error.message) {
        throw new Error('Invalid error format in response');
      }

      if (response.data.error.code !== 'TOKEN_MISSING') {
        throw new Error(`Expected TOKEN_MISSING error, got ${response.data.error.code}`);
      }
    });
  }

  async testChatServiceIntegration() {
    await this.runTest('Chat Service Integration', async () => {
      // Test that chat service is running and room routes are mounted
      const healthResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3003/chat/health',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      this.helpers.assertSuccess(healthResponse, 200);

      if (!healthResponse.data.service || healthResponse.data.service !== 'chat-service') {
        throw new Error('Invalid chat service health response');
      }

      if (!healthResponse.data.websocket || healthResponse.data.websocket !== 'enabled') {
        throw new Error('WebSocket not enabled in chat service');
      }
    });
  }

  async testRoomModelValidation() {
    await this.runTest('Room Model Validation', async () => {
      // Test that room endpoints handle different HTTP methods correctly
      const testRoomId = '507f1f77bcf86cd799439011';
      
      const endpoints = [
        { method: 'POST', path: `/chat/rooms/${testRoomId}/join`, expectedAuth: true },
        { method: 'POST', path: `/chat/rooms/${testRoomId}/leave`, expectedAuth: true },
        { method: 'POST', path: `/chat/rooms/${testRoomId}/participants`, expectedAuth: true },
        { method: 'DELETE', path: `/chat/rooms/${testRoomId}/participants/user`, expectedAuth: true }
      ];

      for (const endpoint of endpoints) {
        const response = await this.helpers.makeRequest(
          endpoint.method,
          `http://localhost:3003${endpoint.path}`,
          null,
          { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
        );

        if (endpoint.expectedAuth && response.status !== 401) {
          throw new Error(`Expected 401 for ${endpoint.path}, got ${response.status}`);
        }
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Room Management Simple Tests\n', 'blue');
    
    await this.testRoomEndpointsExist();
    await this.testRoomAuthenticationRequired();
    await this.testRoomValidationLogic();
    await this.testChatServiceIntegration();
    await this.testRoomModelValidation();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = RoomManagementSimpleTests;