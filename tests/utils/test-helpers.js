const axios = require('axios');
const FormData = require('form-data');
const sharp = require('sharp');
const chalk = require('chalk');

class TestHelpers {
  constructor(config) {
    this.config = config;
    this.createdUsers = [];
    this.createdPhotos = [];
    this.authTokens = {};
  }

  // HTTP Request helpers
  async makeFormRequest(method, url, formData, headers = {}) {
    try {
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          ...formData.getHeaders(),
          ...headers
        },
        validateStatus: () => true
      });
      
      return {
        success: response.status >= 200 && response.status < 300,
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        status: error.response?.status || 500
      };
    }
  }

  async makeRequest(method, url, data = null, headers = {}) {
    try {
      const config = {
        method,
        url,
        timeout: this.config.test.timeout,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.API_KEY || 'phone-app-api-key-change-in-production',
          ...headers
        }
      };

      if (data) {
        if (data instanceof FormData) {
          config.data = data;
          config.headers = { ...config.headers, ...data.getHeaders() };
        } else {
          config.data = data;
        }
      }

      const response = await axios(config);
      return {
        success: true,
        status: response.status,
        data: response.data,
        headers: response.headers
      };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status || 0,
        data: error.response?.data || { error: error.message },
        headers: error.response?.headers || {}
      };
    }
  }

  // Authentication helpers
  async registerUser(userData = null) {
    const user = userData || {
      ...this.config.fixtures.testUser,
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com'
    };

    const response = await this.makeRequest(
      'POST',
      this.config.services.auth.baseUrl + this.config.services.auth.endpoints.register,
      user
    );

    if (response.success && response.data.success) {
      this.createdUsers.push({
        id: response.data.data.user.id,
        username: user.username,
        email: user.email,
        password: user.password
      });
      this.authTokens[user.username] = response.data.data.tokens.accessToken;
    }

    return response;
  }

  async loginUser(identifier, password) {
    const response = await this.makeRequest(
      'POST',
      this.config.services.auth.baseUrl + this.config.services.auth.endpoints.login,
      { identifier, password }
    );

    if (response.success && response.data.success) {
      this.authTokens[identifier] = response.data.data.tokens.accessToken;
    }

    return response;
  }

  getAuthHeaders(username) {
    const token = this.authTokens[username];
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    headers['X-API-Key'] = process.env.API_KEY || 'phone-app-api-key-change-in-production';
    return headers;
  }

  // Photo helpers
  async createTestImage(width = 100, height = 100) {
    return await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .jpeg()
    .toBuffer();
  }

  async uploadPhoto(username, photoData = null) {
    const data = photoData || this.config.fixtures.testPhoto;
    const imageBuffer = await this.createTestImage();
    
    const formData = new FormData();
    formData.append('image', imageBuffer, 'test-image.jpg');
    formData.append('latitude', data.latitude.toString());
    formData.append('longitude', data.longitude.toString());
    formData.append('caption', data.caption);

    const response = await this.makeRequest(
      'POST',
      this.config.services.photos.baseUrl + this.config.services.photos.endpoints.upload,
      formData,
      this.getAuthHeaders(username)
    );

    if (response.success && response.data.success) {
      this.createdPhotos.push({
        id: response.data.data.photo.id,
        username: username
      });
    }

    return response;
  }

  // Assertion helpers
  assertSuccess(response, expectedStatus = null) {
    if (!response.success) {
      throw new Error(`Request failed: ${JSON.stringify(response.data)}`);
    }
    // Health endpoints return {status: "ok"} instead of {success: true}
    if (response.data.status === 'ok') {
      // Health check endpoint - this is valid
    } else if (!response.data.success) {
      throw new Error(`API returned error: ${JSON.stringify(response.data.error)}`);
    }
    if (expectedStatus && response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
  }

  assertError(response, expectedStatus, expectedErrorCode = null) {
    if (response.success && response.data.success) {
      throw new Error(`Expected error but request succeeded`);
    }
    if (response.status !== expectedStatus) {
      throw new Error(`Expected status ${expectedStatus}, got ${response.status}`);
    }
    if (expectedErrorCode && response.data.error?.code !== expectedErrorCode) {
      throw new Error(`Expected error code ${expectedErrorCode}, got ${response.data.error?.code}`);
    }
  }

  // Cleanup helpers
  async cleanup() {
    const { MongoClient, ObjectId } = require('mongodb');
    
    try {
      // Clean up database records
      const client = new MongoClient(this.config.database.mongodb);
      await client.connect();

      // Delete test users
      if (this.createdUsers.length > 0) {
        const authDb = client.db('auth');
        const userIds = this.createdUsers.map(u => u.id);
        const { ObjectId } = require('mongodb');
        await authDb.collection('users').deleteMany({
          _id: { $in: userIds.map(id => new ObjectId(id)) }
        });
        await authDb.collection('sessions').deleteMany({
          userId: { $in: userIds.map(id => new ObjectId(id)) }
        });
      }

      // Delete test photos
      if (this.createdPhotos.length > 0) {
        const photosDb = client.db('photos');
        const photoIds = this.createdPhotos.map(p => p.id);
        await photosDb.collection('photos').deleteMany({
          _id: { $in: photoIds.map(id => new ObjectId(id)) }
        });
      }

      await client.close();
      
      this.log('✅ Cleanup completed', 'green');
    } catch (error) {
      this.log(`❌ Cleanup failed: ${error.message}`, 'red');
    }
  }

  // Logging helpers
  log(message, color = 'white') {
    if (this.config.test.verbose) {
      console.log(chalk[color](message));
    }
  }

  logTest(testName) {
    this.log(`\n🧪 Running: ${testName}`, 'cyan');
  }

  logSuccess(message) {
    this.log(`✅ ${message}`, 'green');
  }

  logError(message) {
    this.log(`❌ ${message}`, 'red');
  }

  logWarning(message) {
    this.log(`⚠️  ${message}`, 'yellow');
  }
}

module.exports = TestHelpers;