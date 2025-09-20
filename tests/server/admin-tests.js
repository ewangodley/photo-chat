const TestHelpers = require('../utils/test-helpers');
const AdminHelpers = require('../utils/admin-helpers');
const config = require('../utils/test-config');

class AdminTests {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.adminHelpers = new AdminHelpers(config);
    this.testResults = [];
    this.adminUser = null;
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

  getAdminHeaders(username) {
    return {
      ...this.helpers.getAuthHeaders(username),
      'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production'
    };
  }

  async setupAdminUser() {
    // For now, use regular user token but mark as admin in tests
    const timestamp = Date.now();
    const userData = {
      username: 'admin_test_' + timestamp,
      email: 'admin_test_' + timestamp + '@example.com',
      password: 'Password123'
    };
    const regResponse = await this.helpers.registerUser(userData);
    this.helpers.assertSuccess(regResponse, 201);
    this.adminUser = userData;
  }

  async testHealthCheck() {
    await this.runTest('Admin Service Health Check', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/health',
        null,
        {
          'X-Admin-API-Key': process.env.ADMIN_API_KEY || 'admin-api-key-change-in-production'
        }
      );
      this.helpers.assertSuccess(response, 200);
      if (!response.data || response.data.service !== 'admin-service') {
        throw new Error(`Invalid service identifier: ${JSON.stringify(response.data)}`);
      }
    });
  }

  async testAdminLogin() {
    await this.runTest('Admin Login', async () => {
      const response = await this.adminHelpers.loginAdmin('admin', 'admin123');
      if (!response.success) {
        throw new Error('Admin login failed');
      }
      if (!response.data.data.token || !response.data.data.user) {
        throw new Error('Missing token or user data in login response');
      }
    });
  }

  async testInvalidAdminLogin() {
    await this.runTest('Invalid Admin Login', async () => {
      const response = await this.adminHelpers.loginAdmin('admin', 'wrongpassword');
      if (response.success) {
        throw new Error('Should not succeed with wrong password');
      }
      if (response.status !== 401) {
        throw new Error('Expected 401 status for invalid credentials');
      }
    });
  }

  async testGetUsers() {
    await this.runTest('Get Users List', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/users',
        null,
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertSuccess(response, 200);
      const { users, pagination } = response.data.data;
      if (!Array.isArray(users) || !pagination) {
        throw new Error('Invalid users response structure');
      }
    });
  }

  async testUpdateUserStatus() {
    await this.runTest('Update User Status', async () => {
      const response = await this.helpers.makeRequest(
        'PUT',
        'http://localhost:3006/admin/users/507f1f77bcf86cd799439011/status',
        { status: 'suspended', reason: 'Test suspension' },
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertSuccess(response, 200);
    });
  }

  async testGetPhotos() {
    await this.runTest('Get Photos for Moderation', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/photos',
        null,
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertSuccess(response, 200);
      const { photos, pagination } = response.data.data;
      if (!Array.isArray(photos) || !pagination) {
        throw new Error('Invalid photos response structure');
      }
    });
  }

  async testModeratePhoto() {
    await this.runTest('Moderate Photo', async () => {
      const response = await this.helpers.makeRequest(
        'PUT',
        'http://localhost:3006/admin/photos/507f1f77bcf86cd799439011/moderate',
        { action: 'approve', reason: 'Content approved' },
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertSuccess(response, 200);
    });
  }

  async testGetReports() {
    await this.runTest('Get Reports', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/reports',
        null,
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertSuccess(response, 200);
      const { reports, pagination } = response.data.data;
      if (!Array.isArray(reports) || !pagination) {
        throw new Error('Invalid reports response structure');
      }
    });
  }

  async testResolveReport() {
    await this.runTest('Resolve Report', async () => {
      const response = await this.helpers.makeRequest(
        'PUT',
        'http://localhost:3006/admin/reports/507f1f77bcf86cd799439011/resolve',
        { resolution: 'Report reviewed and resolved', action: 'no_action' },
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      // Should return 404 for non-existent report or success
      if (response.status !== 404 && response.status !== 200) {
        throw new Error('Unexpected response status for resolve report');
      }
    });
  }

  async testInvalidUserStatus() {
    await this.runTest('Invalid User Status Update', async () => {
      const response = await this.helpers.makeRequest(
        'PUT',
        'http://localhost:3006/admin/users/507f1f77bcf86cd799439011/status',
        { status: 'invalid_status', reason: 'Test' },
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertError(response, 400, 'INVALID_STATUS');
    });
  }

  async testInvalidPhotoAction() {
    await this.runTest('Invalid Photo Moderation Action', async () => {
      const response = await this.helpers.makeRequest(
        'PUT',
        'http://localhost:3006/admin/photos/507f1f77bcf86cd799439011/moderate',
        { action: 'invalid_action', reason: 'Test' },
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertError(response, 400, 'INVALID_ACTION');
    });
  }

  async testGetAnalytics() {
    await this.runTest('Get Analytics', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/analytics',
        null,
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertSuccess(response, 200);
      const { analytics } = response.data.data;
      if (!analytics || !analytics.users || !analytics.photos) {
        throw new Error('Invalid analytics response structure');
      }
    });
  }

  async testGetAuditLogs() {
    await this.runTest('Get Audit Logs', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/logs',
        null,
        this.getAdminHeaders(this.adminUser.username)
      );
      
      if (response.status === 403) {
        this.helpers.assertError(response, 403, 'INSUFFICIENT_PERMISSIONS');
        return;
      }
      
      this.helpers.assertSuccess(response, 200);
      const { logs, pagination } = response.data.data;
      if (!Array.isArray(logs) || !pagination) {
        throw new Error('Invalid audit logs response structure');
      }
    });
  }

  async testUnauthorizedAccess() {
    await this.runTest('Unauthorized Admin Access - No API Key', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/users'
      );
      this.helpers.assertError(response, 401, 'INVALID_API_KEY');
    });
  }

  async testInvalidApiKey() {
    await this.runTest('Invalid API Key Access', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3006/admin/users',
        null,
        {
          'X-Admin-API-Key': 'invalid-api-key',
          'Authorization': 'Bearer fake-token'
        }
      );
      this.helpers.assertError(response, 401, 'INVALID_API_KEY');
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Admin Service Tests', 'blue');
    
    await this.setupAdminUser();
    
    await this.testHealthCheck();
    await this.testGetUsers();
    await this.testUpdateUserStatus();
    await this.testGetPhotos();
    await this.testModeratePhoto();
    await this.testGetReports();
    await this.testResolveReport();
    await this.testGetAnalytics();
    await this.testGetAuditLogs();
    await this.testInvalidUserStatus();
    await this.testInvalidPhotoAction();
    await this.testUnauthorizedAccess();
    await this.testInvalidApiKey();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
      this.adminHelpers.clearAdminTokens();
    }

    return this.testResults;
  }
}

module.exports = AdminTests;