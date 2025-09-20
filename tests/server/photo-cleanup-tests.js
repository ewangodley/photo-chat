const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');
const { MongoClient, ObjectId } = require('mongodb');

class PhotoCleanupTests {
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
    const regResponse = await this.helpers.registerUser();
    this.helpers.assertSuccess(regResponse, 201);
    this.testUser = this.helpers.createdUsers[this.helpers.createdUsers.length - 1];
  }

  async testPhotoCleanupEndpoint() {
    await this.runTest('Photo Cleanup Endpoint', async () => {
      const client = new MongoClient(config.database.mongodb);
      await client.connect();
      const db = client.db('photos');
      
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);
      
      const oldPhoto = {
        _id: new ObjectId(),
        userId: new ObjectId(this.testUser.id),
        s3Key: 'test-old-photo.jpg',
        uploadedAt: oldDate,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        latitude: 37.7749,
        longitude: -122.4194
      };
      
      await db.collection('photos').insertOne(oldPhoto);
      await client.close();

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3002/photos/cleanup',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );

      this.helpers.assertSuccess(response, 200);
      
      await client.connect();
      const remainingPhoto = await db.collection('photos').findOne({ _id: oldPhoto._id });
      await client.close();
      
      if (remainingPhoto) {
        throw new Error('Old photo was not deleted by cleanup job');
      }
    });
  }

  async testDateBoundaryLogic() {
    await this.runTest('30-Day Boundary Logic', async () => {
      const client = new MongoClient(config.database.mongodb);
      await client.connect();
      const db = client.db('photos');
      
      const exactly30Days = new Date();
      exactly30Days.setDate(exactly30Days.getDate() - 30);
      
      const exactly29Days = new Date();
      exactly29Days.setDate(exactly29Days.getDate() - 29);
      
      const oldPhoto = {
        _id: new ObjectId(),
        userId: new ObjectId(this.testUser.id),
        s3Key: 'test-30day-photo.jpg',
        uploadedAt: exactly30Days,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        latitude: 37.7749,
        longitude: -122.4194
      };
      
      const recentPhoto = {
        _id: new ObjectId(),
        userId: new ObjectId(this.testUser.id),
        s3Key: 'test-29day-photo.jpg',
        uploadedAt: exactly29Days,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        latitude: 37.7749,
        longitude: -122.4194
      };
      
      await db.collection('photos').insertMany([oldPhoto, recentPhoto]);
      await client.close();

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3002/photos/cleanup',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );

      this.helpers.assertSuccess(response, 200);
      
      await client.connect();
      const deletedPhoto = await db.collection('photos').findOne({ _id: oldPhoto._id });
      const preservedPhoto = await db.collection('photos').findOne({ _id: recentPhoto._id });
      await client.close();
      
      if (deletedPhoto) {
        throw new Error('30-day old photo was not deleted');
      }
      if (!preservedPhoto) {
        throw new Error('29-day old photo was incorrectly deleted');
      }
    });
  }

  async testEmptyDatabase() {
    await this.runTest('Empty Database Handling', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3002/photos/cleanup',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );

      this.helpers.assertSuccess(response, 200);
    });
  }

  async testMixedPhotoAges() {
    await this.runTest('Mixed Photo Ages', async () => {
      const client = new MongoClient(config.database.mongodb);
      await client.connect();
      const db = client.db('photos');
      
      const photos = [
        {
          _id: new ObjectId(),
          userId: new ObjectId(this.testUser.id),
          s3Key: 'old1.jpg',
          uploadedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          },
          latitude: 37.7749,
          longitude: -122.4194
        },
        {
          _id: new ObjectId(),
          userId: new ObjectId(this.testUser.id),
          s3Key: 'old2.jpg',
          uploadedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          },
          latitude: 37.7749,
          longitude: -122.4194
        },
        {
          _id: new ObjectId(),
          userId: new ObjectId(this.testUser.id),
          s3Key: 'recent.jpg',
          uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          },
          latitude: 37.7749,
          longitude: -122.4194
        }
      ];
      
      await db.collection('photos').insertMany(photos);
      await client.close();

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3002/photos/cleanup',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );

      this.helpers.assertSuccess(response, 200);
      
      await client.connect();
      const remaining = await db.collection('photos').find({}).toArray();
      await client.close();
      
      if (remaining.length !== 1) {
        throw new Error(`Expected 1 remaining photo, found ${remaining.length}`);
      }
      if (remaining[0].s3Key !== 'recent.jpg') {
        throw new Error('Wrong photo preserved');
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Photo Cleanup Tests\n', 'blue');
    
    await this.setupTestUser();
    await this.testPhotoCleanupEndpoint();
    await this.testDateBoundaryLogic();
    await this.testEmptyDatabase();
    await this.testMixedPhotoAges();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = PhotoCleanupTests;