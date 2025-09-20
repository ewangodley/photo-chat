const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class NotificationTests {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.testResults = [];
    this.testUser = null;
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

  async setupTestUser() {
    const timestamp = Date.now();
    const userData = {
      username: 'notif_test_' + timestamp,
      email: 'notif_test_' + timestamp + '@example.com',
      password: 'Password123'
    };
    const regResponse = await this.helpers.registerUser(userData);
    this.helpers.assertSuccess(regResponse, 201);
    this.testUser = userData;
  }

  async testHealthCheck() {
    await this.runTest('Notification Service Health Check', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3005/notifications/health'
      );
      this.helpers.assertSuccess(response, 200);
      if (!response.data || response.data.service !== 'notification-service') {
        throw new Error(`Invalid service identifier: ${JSON.stringify(response.data)}`);
      }
    });
  }

  async testSendNotification() {
    await this.runTest('Send Notification', async () => {
      const notificationData = {
        userId: '507f1f77bcf86cd799439011',
        type: 'message',
        title: 'Test Notification',
        message: 'This is a test notification',
        data: { messageId: '123' }
      };

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3005/notifications/send',
        notificationData
      );
      this.helpers.assertSuccess(response, 201);
      
      const { notification } = response.data.data;
      if (!notification.title || notification.title !== 'Test Notification') {
        throw new Error('Notification not created correctly');
      }
    });
  }

  async testGetNotifications() {
    await this.runTest('Get User Notifications', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3005/notifications',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      const { notifications, unreadCount } = response.data.data;
      if (!Array.isArray(notifications)) {
        throw new Error('Notifications should be an array');
      }
      if (typeof unreadCount !== 'number') {
        throw new Error('Unread count should be a number');
      }
    });
  }

  async testMarkAsRead() {
    await this.runTest('Mark Notification as Read', async () => {
      const notificationData = {
        userId: '507f1f77bcf86cd799439011',
        type: 'message',
        title: 'Read Test',
        message: 'Test read functionality'
      };

      const createResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3005/notifications/send',
        notificationData
      );
      this.helpers.assertSuccess(createResponse, 201);
      
      const notificationId = createResponse.data.data.notification._id;

      const response = await this.helpers.makeRequest(
        'PUT',
        `http://localhost:3005/notifications/${notificationId}/read`,
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.data.message.includes('marked as read')) {
        throw new Error('Mark as read response invalid');
      }
    });
  }

  async testPagination() {
    await this.runTest('Notification Pagination', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3005/notifications?page=1&limit=5',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      const { page, totalPages } = response.data.data;
      if (page !== 1) {
        throw new Error('Page number incorrect');
      }
      if (typeof totalPages !== 'number') {
        throw new Error('Total pages should be a number');
      }
    });
  }

  async testUnauthorizedAccess() {
    await this.runTest('Unauthorized Notification Access', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3005/notifications'
      );
      this.helpers.assertError(response, 401, 'TOKEN_MISSING');
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Notification Service Tests', 'blue');
    
    await this.setupTestUser();
    
    await this.testHealthCheck();
    await this.testSendNotification();
    await this.testGetNotifications();
    await this.testMarkAsRead();
    await this.testPagination();
    await this.testUnauthorizedAccess();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = NotificationTests;