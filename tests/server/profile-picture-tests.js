const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class ProfilePictureTests {
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
    const userData = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'testpass123'
    };
    
    // Register user
    const registerResponse = await this.helpers.makeRequest(
      'POST',
      'http://localhost:3001/auth/register',
      userData,
      { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
    );
    
    this.helpers.assertSuccess(registerResponse, 201);
    this.testUser = registerResponse.data;
  }

  async createTestImage() {
    // Create a simple test image buffer (1x1 pixel PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xDE, 0x00, 0x00, 0x00,
      0x0C, 0x49, 0x44, 0x41, 0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x37, 0x6E, 0xF9, 0x24, 0x00, 0x00,
      0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    return testImageBuffer;
  }

  async testProfilePictureUpload() {
    await this.runTest('Profile Picture Upload', async () => {
      const testImage = await this.createTestImage();
      
      const formData = new FormData();
      formData.append('profilePicture', testImage, {
        filename: 'test-profile.png',
        contentType: 'image/png'
      });

      const response = await this.helpers.makeFormRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload',
        formData,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.profilePicture) {
        throw new Error('Profile picture URL not returned');
      }
      
      if (!response.data.profilePicture.includes('profile-pictures/')) {
        throw new Error('Invalid profile picture URL format');
      }
      
      // Store for cleanup
      this.testUser.profilePicture = response.data.profilePicture;
    });
  }

  async testProfilePictureUploadNoFile() {
    await this.runTest('Profile Picture Upload - No File', async () => {
      const formData = new FormData();

      const response = await this.helpers.makeFormRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload',
        formData,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertError(response, 400, 'NO_FILE');
    });
  }

  async testProfilePictureUploadInvalidFile() {
    await this.runTest('Profile Picture Upload - Invalid File', async () => {
      const formData = new FormData();
      formData.append('profilePicture', Buffer.from('not an image'), {
        filename: 'test.txt',
        contentType: 'text/plain'
      });

      const response = await this.helpers.makeFormRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload',
        formData,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      // Should fail due to file filter
      if (response.success) {
        throw new Error('Should have rejected non-image file');
      }
    });
  }

  async testProfilePictureDelete() {
    await this.runTest('Profile Picture Delete', async () => {
      const response = await this.helpers.makeRequest(
        'DELETE',
        'http://localhost:3004/users/profile-picture/delete',
        null,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.message || !response.data.message.includes('deleted')) {
        throw new Error('Invalid delete response message');
      }
    });
  }

  async testProfilePictureDeleteNoPicture() {
    await this.runTest('Profile Picture Delete - No Picture', async () => {
      const response = await this.helpers.makeRequest(
        'DELETE',
        'http://localhost:3004/users/profile-picture/delete',
        null,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertError(response, 400, 'NO_PROFILE_PICTURE');
    });
  }

  async testProfilePictureUnauthorized() {
    await this.runTest('Profile Picture Upload - Unauthorized', async () => {
      const testImage = await this.createTestImage();
      
      const formData = new FormData();
      formData.append('profilePicture', testImage, {
        filename: 'test-profile.png',
        contentType: 'image/png'
      });

      const response = await this.helpers.makeFormRequest(
        'POST',
        'http://localhost:3004/users/profile-picture/upload',
        formData,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production'
          // No Authorization header
        }
      );

      this.helpers.assertError(response, 401);
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Profile Picture Tests\n', 'blue');
    
    await this.setupTestUser();
    await this.testProfilePictureUpload();
    await this.testProfilePictureUploadNoFile();
    await this.testProfilePictureUploadInvalidFile();
    await this.testProfilePictureDelete();
    await this.testProfilePictureDeleteNoPicture();
    await this.testProfilePictureUnauthorized();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = ProfilePictureTests;