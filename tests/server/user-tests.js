const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class UserTests {
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
      username: 'user_test_' + timestamp,
      email: 'user_test_' + timestamp + '@example.com',
      password: 'Password123'
    };
    const regResponse = await this.helpers.registerUser(userData);
    this.helpers.assertSuccess(regResponse, 201);
    this.testUser = userData;
  }

  async testHealthCheck() {
    await this.runTest('User Service Health Check', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3004/users/health'
      );
      this.helpers.assertSuccess(response, 200);
      if (!response.data || response.data.service !== 'user-service') {
        throw new Error(`Invalid service identifier: ${JSON.stringify(response.data)}`);
      }
    });
  }

  async testGetProfile() {
    await this.runTest('Get User Profile', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3004/users/profile',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      const { profile } = response.data.data;
      if (!profile.userId) {
        throw new Error('Profile missing userId');
      }
    });
  }

  async testUpdateProfile() {
    await this.runTest('Update User Profile', async () => {
      const profileData = {
        displayName: 'Test User',
        bio: 'Test bio',
        location: { city: 'Test City', country: 'Test Country' },
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: { push: false, email: true }
        }
      };

      const response = await this.helpers.makeRequest(
        'PUT',
        'http://localhost:3004/users/profile',
        profileData,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      const { profile } = response.data.data;
      if (profile.displayName !== 'Test User') {
        throw new Error('Profile not updated correctly');
      }
    });
  }

  async testBlockUser() {
    await this.runTest('Block User', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3004/users/block',
        { targetUserId: '507f1f77bcf86cd799439011' },
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.data.message.includes('blocked successfully')) {
        throw new Error('Block user response invalid');
      }
    });
  }

  async testUnblockUser() {
    await this.runTest('Unblock User', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3004/users/unblock',
        { targetUserId: '507f1f77bcf86cd799439011' },
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.data.message.includes('unblocked successfully')) {
        throw new Error('Unblock user response invalid');
      }
    });
  }

  async testBlockSelf() {
    await this.runTest('Block Self Validation', async () => {
      // Get profile first to get the userId
      const profileResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3004/users/profile',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      const userId = profileResponse.data.data.profile.userId;
      
      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3004/users/block',
        { targetUserId: userId },
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      
      if (response.status !== 400) {
        throw new Error('Should prevent blocking self');
      }
      if (!response.data.error.code.includes('INVALID_OPERATION')) {
        throw new Error('Wrong error code for self-block');
      }
    });
  }

  async testProfilePreferences() {
    await this.runTest('Profile Preferences Update', async () => {
      const profileData = {
        preferences: {
          theme: 'light',
          language: 'es',
          notifications: { push: true, email: false, chat: true },
          privacy: { profileVisible: false, locationVisible: true }
        }
      };

      const response = await this.helpers.makeRequest(
        'PUT',
        'http://localhost:3004/users/profile',
        profileData,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);
      
      const { profile } = response.data.data;
      if (profile.preferences.theme !== 'light') {
        throw new Error('Preferences not updated correctly');
      }
      if (profile.preferences.language !== 'es') {
        throw new Error('Language preference not updated');
      }
    });
  }

  async testUnauthorizedAccess() {
    await this.runTest('Unauthorized Profile Access', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3004/users/profile'
      );
      this.helpers.assertError(response, 401, 'TOKEN_MISSING');
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting User Service Tests', 'blue');
    
    await this.setupTestUser();
    
    await this.testHealthCheck();
    await this.testGetProfile();
    await this.testUpdateProfile();
    await this.testProfilePreferences();
    await this.testBlockUser();
    await this.testUnblockUser();
    await this.testBlockSelf();
    await this.testUnauthorizedAccess();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = UserTests;