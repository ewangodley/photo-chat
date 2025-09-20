const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class ChatTests {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.testResults = [];
    this.testUsers = [];
    this.testMessageId = null;
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

  async setupTestUsers() {
    const timestamp = Date.now();
    
    for (let i = 1; i <= 2; i++) {
      const userData = {
        username: `chat_user_${i}_${timestamp}`,
        email: `chat_user_${i}_${timestamp}@example.com`,
        password: 'Password123'
      };
      
      const response = await this.helpers.registerUser(userData);
      this.helpers.assertSuccess(response, 201);
      this.testUsers.push(userData);
    }
  }

  async testHealthCheck() {
    await this.runTest('Chat Service Health Check', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3003/chat/health'
      );
      this.helpers.assertSuccess(response, 200);
      if (!response.data || response.data.service !== 'chat-service') {
        throw new Error(`Invalid service identifier: ${JSON.stringify(response.data)}`);
      }
      if (!response.data.websocket || response.data.websocket !== 'enabled') {
        throw new Error('WebSocket should be enabled');
      }
    });
  }

  async testSendMessage() {
    await this.runTest('Send Message - Offline Delivery', async () => {
      const sender = this.testUsers[0];
      const recipient = this.testUsers[1];
      
      const messageData = {
        recipientId: '507f1f77bcf86cd799439011',
        roomId: '507f1f77bcf86cd799439012',
        content: 'Test offline message',
        messageType: 'text'
      };

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/send',
        messageData,
        this.helpers.getAuthHeaders(sender.username)
      );

      this.helpers.assertSuccess(response, 201);
      
      const { message } = response.data.data;
      if (!message.id || !message.content) {
        throw new Error('Missing required fields in message response');
      }
      this.testMessageId = message.id;
    });
  }

  async testGetPendingMessages() {
    await this.runTest('Get Pending Messages', async () => {
      const user = this.testUsers[0];
      
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3003/chat/pending',
        null,
        this.helpers.getAuthHeaders(user.username)
      );

      this.helpers.assertSuccess(response, 200);
      
      const { messages } = response.data.data;
      if (!Array.isArray(messages)) {
        throw new Error('Messages should be an array');
      }
    });
  }

  async testCompleteMessageFlow() {
    await this.runTest('Complete Message Lifecycle', async () => {
      const sender = this.testUsers[0];
      const recipient = this.testUsers[1];
      
      // Use static recipient ID for testing
      const recipientId = '507f1f77bcf86cd799439014';
      
      const messageData = {
        recipientId,
        content: 'Lifecycle test message',
        messageType: 'text'
      };

      const sendResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/send',
        messageData,
        this.helpers.getAuthHeaders(sender.username)
      );
      this.helpers.assertSuccess(sendResponse, 201);
      
      if (!sendResponse.data.data.message.id) {
        throw new Error('Message ID not returned');
      }
      if (sendResponse.data.data.message.status !== 'pending') {
        throw new Error('Message should be pending for offline recipient');
      }
    });
  }

  async testMarkMessageDelivered() {
    await this.runTest('Mark Non-existent Message Delivered', async () => {
      const user = this.testUsers[0];
      const messageId = '507f1f77bcf86cd799439013';
      
      const response = await this.helpers.makeRequest(
        'POST',
        `http://localhost:3003/chat/delivered/${messageId}`,
        null,
        this.helpers.getAuthHeaders(user.username)
      );

      this.helpers.assertError(response, 404, 'MESSAGE_NOT_FOUND');
    });
  }

  async testCleanupMessage() {
    await this.runTest('Cleanup Non-existent Message', async () => {
      const user = this.testUsers[0];
      const messageId = '507f1f77bcf86cd799439013';
      
      const response = await this.helpers.makeRequest(
        'DELETE',
        `http://localhost:3003/chat/cleanup/${messageId}`,
        null,
        this.helpers.getAuthHeaders(user.username)
      );

      this.helpers.assertError(response, 404, 'MESSAGE_NOT_FOUND');
    });
  }

  async testMessageValidation() {
    await this.runTest('Message Content Validation', async () => {
      const sender = this.testUsers[0];
      
      const messageData = {
        recipientId: '507f1f77bcf86cd799439011',
        content: 'Valid test message',
        messageType: 'text'
      };

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/send',
        messageData,
        this.helpers.getAuthHeaders(sender.username)
      );
      
      this.helpers.assertSuccess(response, 201);
      
      if (!response.data.data.message.content) {
        throw new Error('Message content should be preserved');
      }
    });
  }

  async testUnauthorizedAccess() {
    await this.runTest('Unauthorized Message Access', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3003/chat/pending'
      );

      this.helpers.assertError(response, 401, 'TOKEN_MISSING');
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Chat Service Tests', 'blue');
    
    await this.setupTestUsers();
    
    await this.testHealthCheck();
    await this.testSendMessage();
    await this.testGetPendingMessages();
    await this.testMarkMessageDelivered();
    await this.testCleanupMessage();
    await this.testUnauthorizedAccess();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = ChatTests;