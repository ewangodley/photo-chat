const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class ProfilePictureSimpleTests {
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

  async testProfilePictureEndpointsExist() {
    await this.runTest('Profile Picture Endpoints Exist', async () => {
      // Test upload endpoint exists (should return 401 without auth)
      const uploadResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      if (uploadResponse.status === 404) {
        throw new Error('Upload endpoint not found');
      }

      if (uploadResponse.status !== 401) {
        throw new Error(`Expected 401 for upload without auth, got ${uploadResponse.status}`);
      }

      // Test delete endpoint exists (should return 401 without auth)
      const deleteResponse = await this.helpers.makeRequest(
        'DELETE',
        'http://localhost:3004/users/profile-picture/delete',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      if (deleteResponse.status === 404) {
        throw new Error('Delete endpoint not found');
      }

      if (deleteResponse.status !== 401) {
        throw new Error(`Expected 401 for delete without auth, got ${deleteResponse.status}`);
      }
    });
  }

  async testProfilePictureAuthRequired() {
    await this.runTest('Profile Picture Authentication Required', async () => {
      // Test upload without API key
      const uploadResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload'
      );

      if (uploadResponse.status !== 401 && uploadResponse.status !== 403) {
        throw new Error(`Expected auth error for upload without API key, got ${uploadResponse.status}`);
      }

      // Test delete without API key
      const deleteResponse = await this.helpers.makeRequest(
        'DELETE',
        'http://localhost:3004/users/profile-picture/delete'
      );

      if (deleteResponse.status !== 401 && deleteResponse.status !== 403) {
        throw new Error(`Expected auth error for delete without API key, got ${deleteResponse.status}`);
      }
    });
  }

  async testUserServiceIntegration() {
    await this.runTest('User Service Integration', async () => {
      // Test that user service is running and profile picture routes are mounted
      const healthResponse = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3004/users/health',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      this.helpers.assertSuccess(healthResponse, 200);

      if (!healthResponse.data.service || healthResponse.data.service !== 'user-service') {
        throw new Error('Invalid user service health response');
      }
    });
  }

  async testProfilePictureValidation() {
    await this.runTest('Profile Picture Validation Logic', async () => {
      // Test that endpoints return proper error structure
      const uploadResponse = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload',
        null,
        { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
      );

      // Should have proper error structure
      if (!uploadResponse.data || !uploadResponse.data.error) {
        throw new Error('Missing error structure in response');
      }

      if (!uploadResponse.data.error.code || !uploadResponse.data.error.message) {
        throw new Error('Invalid error format in response');
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Profile Picture Simple Tests\n', 'blue');
    
    await this.testProfilePictureEndpointsExist();
    await this.testProfilePictureAuthRequired();
    await this.testUserServiceIntegration();
    await this.testProfilePictureValidation();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = ProfilePictureSimpleTests;