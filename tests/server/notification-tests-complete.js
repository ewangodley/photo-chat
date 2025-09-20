const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class NotificationTestsComplete {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.testResults = [];
    this.testUser = null;
    this.testNotificationId = null;
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
    await this.runTest('Health Check', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3005/notifications/health'
      );
      this.helpers.assertSuccess(response, 200);
      if (response.data.service !== 'notification-service') {
        throw new Error('Invalid service identifier');
      }
    });
  }

  async testSendNotification() {
    await this.runTest('Send Notification', async () => {
      const loginResponse = await this.helpers.loginUser(this.testUser);
      const userId = loginResponse.data.data.user.id;

      const notificationData = {
        userId,
        type: 'message',
        title: 'Test Notification',
        message: 'Test message',
        data: { messageId: '123' }
      };

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3005/notifications/send',
        notificationData
      );
      this.helpers.assertSuccess(response, 201);
      
      const { notification } = response.data.data;
      this.testNotificationId = notification._id;
      if (notification.title !== 'Test Notification') {
        throw new Error('Notification not created correctly');
      }
    });
  }

  async testGetNotifications() {
    await this.runTest('Get Notifications', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3005/notifications',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      const { notifications, unreadCount, page, totalPages } = response.data.data;
      if (!Array.isArray(notifications)) {
        throw new Error('Notifications should be an array');
      }
      if (typeof unreadCount !== 'number') {
        throw new Error('Unread count should be a number');
      }
      if (notifications.length > 0 && !notifications[0].title) {
        throw new Error('Notification missing title');
      }
    });
  }

  async testMarkAsRead() {
    await this.runTest('Mark Notification as Read', async () => {
      if (!this.testNotificationId) {
        throw new Error('No notification ID available for testing');
      }

      const response = await this.helpers.makeRequest(
        'PUT',
        `http://localhost:3005/notifications/${this.testNotificationId}/read`,
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

  async testInvalidNotificationTypes() {
    await this.runTest('Invalid Notification Type', async () => {
      const loginResponse = await this.helpers.loginUser(this.testUser);
      const userId = loginResponse.data.data.user.id;

      const notificationData = {
        userId,
        type: 'invalid_type',
        title: 'Test',
        message: 'Test'
      };

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3005/notifications/send',
        notificationData
      );
      // Should fail validation
      if (response.status < 400) {
        throw new Error('Should reject invalid notification type');
      }
    });
  }

  async testUnauthorizedAccess() {
    await this.runTest('Unauthorized Access', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3005/notifications'
      );
      this.helpers.assertError(response, 401, 'TOKEN_MISSING');
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Complete Notification Tests', 'blue');
    
    await this.setupTestUser();
    
    await this.testHealthCheck();
    await this.testSendNotification();
    await this.testGetNotifications();
    await this.testMarkAsRead();
    await this.testPagination();
    await this.testInvalidNotificationTypes();
    await this.testUnauthorizedAccess();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = NotificationTestsComplete;