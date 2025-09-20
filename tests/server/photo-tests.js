const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class PhotoTests {
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
    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  async setupTestUser() {
    const timestamp = Date.now();
    const userData = {
      username: 'photo_test_' + timestamp,
      email: 'photo_test_' + timestamp + '@example.com',
      password: 'Password123'
    };
    const regResponse = await this.helpers.registerUser(userData);
    this.helpers.assertSuccess(regResponse, 201);
    this.testUser = userData;
  }

  async testHealthCheck() {
    await this.runTest('Photo Service Health Check', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.photos.baseUrl + config.services.photos.endpoints.health
      );
      this.helpers.assertSuccess(response, 200);
      if (!response.data || response.data.service !== 'photo-service') {
        throw new Error(`Invalid service identifier in health check: ${JSON.stringify(response.data)}`);
      }
    });
  }

  async testPhotoUpload() {
    await this.runTest('Photo Upload - Valid Image', async () => {
      const response = await this.helpers.uploadPhoto(this.testUser.username);
      this.helpers.assertSuccess(response, 201);

      const { photo } = response.data.data;
      if (!photo.id || !photo.url || !photo.thumbnailUrl) {
        throw new Error('Missing required fields in photo upload response');
      }
      if (!photo.location || !photo.location.latitude || !photo.location.longitude) {
        throw new Error('Missing location data in photo response');
      }
    });
  }

  async testPhotoUploadWithoutAuth() {
    await this.runTest('Photo Upload - No Authentication', async () => {
      const imageBuffer = await this.helpers.createTestImage();
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('image', imageBuffer, 'test-image.jpg');
      formData.append('latitude', '37.7749');
      formData.append('longitude', '-122.4194');

      const response = await this.helpers.makeRequest(
        'POST',
        config.services.photos.baseUrl + config.services.photos.endpoints.upload,
        formData
      );
      this.helpers.assertError(response, 401, 'TOKEN_MISSING');
    });
  }

  async testPhotoUploadInvalidCoordinates() {
    await this.runTest('Photo Upload - Invalid Coordinates', async () => {
      const imageBuffer = await this.helpers.createTestImage();
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('image', imageBuffer, 'test-image.jpg');
      formData.append('latitude', '999'); // Invalid latitude
      formData.append('longitude', '-122.4194');

      const response = await this.helpers.makeRequest(
        'POST',
        config.services.photos.baseUrl + config.services.photos.endpoints.upload,
        formData,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertError(response, 400, 'INVALID_COORDINATES');
    });
  }

  async testPhotoUploadNoFile() {
    await this.runTest('Photo Upload - No File', async () => {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('latitude', '37.7749');
      formData.append('longitude', '-122.4194');

      const response = await this.helpers.makeRequest(
        'POST',
        config.services.photos.baseUrl + config.services.photos.endpoints.upload,
        formData,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertError(response, 400, 'FILE_MISSING');
    });
  }

  async testGetUserPhotos() {
    await this.runTest('Get User Photos - Empty List', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.photos.baseUrl + config.services.photos.endpoints.myPhotos,
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);

      const { photos, pagination } = response.data.data;
      if (!Array.isArray(photos) || typeof pagination !== 'object') {
        throw new Error('Invalid response structure for user photos');
      }
    });
  }

  async testGetUserPhotosWithData() {
    await this.runTest('Get User Photos - With Data', async () => {
      // First upload a photo
      await this.helpers.uploadPhoto(this.testUser.username);

      // Then get user photos
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.photos.baseUrl + config.services.photos.endpoints.myPhotos,
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);

      const { photos, pagination } = response.data.data;
      if (photos.length === 0) {
        throw new Error('Expected at least one photo in user photos');
      }
      if (pagination.total === 0) {
        throw new Error('Expected pagination total > 0');
      }
    });
  }

  async testGetNearbyPhotos() {
    await this.runTest('Get Nearby Photos - Valid Coordinates', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.photos.baseUrl + config.services.photos.endpoints.nearby + 
        '?latitude=37.7749&longitude=-122.4194&radius=1000',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);

      const { photos, pagination } = response.data.data;
      if (!Array.isArray(photos) || typeof pagination !== 'object') {
        throw new Error('Invalid response structure for nearby photos');
      }
    });
  }

  async testGetNearbyPhotosInvalidCoordinates() {
    await this.runTest('Get Nearby Photos - Invalid Coordinates', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.photos.baseUrl + config.services.photos.endpoints.nearby + 
        '?latitude=invalid&longitude=-122.4194',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertError(response, 400, 'INVALID_COORDINATES');
    });
  }

  async testGetNearbyPhotosNoAuth() {
    await this.runTest('Get Nearby Photos - No Authentication', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.photos.baseUrl + config.services.photos.endpoints.nearby + 
        '?latitude=37.7749&longitude=-122.4194'
      );
      this.helpers.assertError(response, 401, 'TOKEN_MISSING');
    });
  }

  async testDeletePhoto() {
    await this.runTest('Delete Photo - Own Photo', async () => {
      // First upload a photo
      const uploadResponse = await this.helpers.uploadPhoto(this.testUser.username);
      this.helpers.assertSuccess(uploadResponse, 201);
      
      if (!uploadResponse.data || !uploadResponse.data.data || !uploadResponse.data.data.photo) {
        throw new Error('Upload response missing photo data');
      }
      
      const photoId = uploadResponse.data.data.photo.id;

      // Then delete it
      const response = await this.helpers.makeRequest(
        'DELETE',
        config.services.photos.baseUrl + config.services.photos.endpoints.delete + '/' + photoId,
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);

      if (!response.data.data.message.includes('deleted')) {
        throw new Error('Expected deletion confirmation message');
      }
    });
  }

  async testDeleteNonexistentPhoto() {
    await this.runTest('Delete Photo - Nonexistent Photo', async () => {
      const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
      const response = await this.helpers.makeRequest(
        'DELETE',
        config.services.photos.baseUrl + config.services.photos.endpoints.delete + '/' + fakeId,
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertError(response, 404, 'PHOTO_NOT_FOUND');
    });
  }

  async testPaginationLimits() {
    await this.runTest('Photo Pagination - Limit Validation', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.photos.baseUrl + config.services.photos.endpoints.nearby + 
        '?latitude=37.7749&longitude=-122.4194&limit=150',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 200);

      const { pagination } = response.data.data;
      if (pagination.limit > 100) {
        throw new Error('Limit should be capped at 100');
      }
    });
  }

  async testPhotoCaption() {
    await this.runTest('Photo Upload - With Caption', async () => {
      const imageBuffer = await this.helpers.createTestImage();
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('image', imageBuffer, 'test-caption.jpg');
      formData.append('latitude', '37.7749');
      formData.append('longitude', '-122.4194');
      formData.append('caption', 'Test photo caption');
      formData.append('isPublic', 'true');

      const response = await this.helpers.makeRequest(
        'POST',
        config.services.photos.baseUrl + config.services.photos.endpoints.upload,
        formData,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertSuccess(response, 201);
      
      const { photo } = response.data.data;
      if (photo.caption !== 'Test photo caption') {
        throw new Error('Caption not saved correctly');
      }
    });
  }

  async testNearbyRadius() {
    await this.runTest('Nearby Photos - Large Radius Validation', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        config.services.photos.baseUrl + config.services.photos.endpoints.nearby + 
        '?latitude=37.7749&longitude=-122.4194&radius=60000',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      this.helpers.assertError(response, 400, 'RADIUS_TOO_LARGE');
    });
  }

  async testDeleteOthersPhoto() {
    await this.runTest('Delete Photo - Forbidden Access', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await this.helpers.makeRequest(
        'DELETE',
        config.services.photos.baseUrl + config.services.photos.endpoints.delete + '/' + fakeId,
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );
      // Should return 404 (not found) or 403 (forbidden)
      if (response.status !== 404 && response.status !== 403) {
        throw new Error('Should prevent deleting others photos');
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Photo Service Tests', 'blue');
    
    await this.setupTestUser();
    
    await this.testHealthCheck();
    await this.testPhotoUpload();
    await this.testPhotoUploadWithoutAuth();
    await this.testPhotoUploadInvalidCoordinates();
    await this.testPhotoUploadNoFile();
    await this.testGetUserPhotos();
    await this.testGetUserPhotosWithData();
    await this.testGetNearbyPhotos();
    await this.testGetNearbyPhotosInvalidCoordinates();
    await this.testGetNearbyPhotosNoAuth();
    await this.testDeletePhoto();
    await this.testDeleteNonexistentPhoto();
    await this.testDeleteOthersPhoto();
    await this.testPaginationLimits();
    await this.testPhotoCaption();
    await this.testNearbyRadius();

    // Cleanup
    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = PhotoTests;