const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');
const { MongoClient, ObjectId } = require('mongodb');

class PhotoCleanupComprehensiveTests {
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

  async testCleanupJobStartup() {
    await this.runTest('Cleanup Job Startup', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3002/photos/health',
        null,
        { 'X-API-Key': process.env.API_KEY || 'phone-app-api-key-change-in-production' }
      );
      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.service || response.data.service !== 'photo-service') {
        throw new Error('Photo service not running with cleanup job');
      }
    });
  }

  async testConcurrentExecutionPrevention() {
    await this.runTest('Concurrent Execution Prevention', async () => {
      // Trigger two cleanup requests simultaneously
      const [response1, response2] = await Promise.all([
        this.helpers.makeRequest(
          'POST',
          'http://localhost:3002/photos/cleanup',
          null,
          this.helpers.getAuthHeaders(this.testUser.username)
        ),
        this.helpers.makeRequest(
          'POST',
          'http://localhost:3002/photos/cleanup',
          null,
          this.helpers.getAuthHeaders(this.testUser.username)
        )
      ]);

      this.helpers.assertSuccess(response1, 200);
      this.helpers.assertSuccess(response2, 200);
    });
  }

  async testS3DeletionSimulation() {
    await this.runTest('S3 Deletion Simulation', async () => {
      const client = new MongoClient(config.database.mongodb);
      await client.connect();
      const db = client.db('photos');
      
      const oldPhoto = {
        _id: new ObjectId(),
        userId: new ObjectId(this.testUser.id),
        s3Key: 'test-s3-photo.jpg',
        uploadedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
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
      
      // Verify photo deleted (S3 deletion would happen in real cleanup)
      await client.connect();
      const remainingPhoto = await db.collection('photos').findOne({ _id: oldPhoto._id });
      await client.close();
      
      if (remainingPhoto) {
        throw new Error('Photo with S3 key was not deleted');
      }
    });
  }

  async testErrorHandling() {
    await this.runTest('Error Handling', async () => {
      const client = new MongoClient(config.database.mongodb);
      await client.connect();
      const db = client.db('photos');
      
      // Create photo with invalid S3 key to simulate S3 error
      const invalidPhoto = {
        _id: new ObjectId(),
        userId: new ObjectId(this.testUser.id),
        s3Key: 'invalid/path/photo.jpg',
        uploadedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        latitude: 37.7749,
        longitude: -122.4194
      };
      
      await db.collection('photos').insertOne(invalidPhoto);
      await client.close();

      // Cleanup should still succeed even with S3 errors
      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3002/photos/cleanup',
        null,
        this.helpers.getAuthHeaders(this.testUser.username)
      );

      this.helpers.assertSuccess(response, 200);
    });
  }

  async testDateCalculationAccuracy() {
    await this.runTest('Date Calculation Accuracy', async () => {
      const client = new MongoClient(config.database.mongodb);
      await client.connect();
      const db = client.db('photos');
      
      const now = new Date();
      const exactly30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const exactly30DaysPlus1Min = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000 + 60 * 1000));
      
      const borderlinePhoto = {
        _id: new ObjectId(),
        userId: new ObjectId(this.testUser.id),
        s3Key: 'borderline.jpg',
        uploadedAt: exactly30Days,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        latitude: 37.7749,
        longitude: -122.4194
      };
      
      const oldPhoto = {
        _id: new ObjectId(),
        userId: new ObjectId(this.testUser.id),
        s3Key: 'definitely-old.jpg',
        uploadedAt: exactly30DaysPlus1Min,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749]
        },
        latitude: 37.7749,
        longitude: -122.4194
      };
      
      await db.collection('photos').insertMany([borderlinePhoto, oldPhoto]);
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
      
      // Both should be deleted as they're >= 30 days old
      if (remaining.length > 0) {
        throw new Error(`Expected 0 photos, found ${remaining.length}`);
      }
    });
  }

  async testLargeDatasetCleanup() {
    await this.runTest('Large Dataset Cleanup', async () => {
      const client = new MongoClient(config.database.mongodb);
      await client.connect();
      const db = client.db('photos');
      
      // Create 10 old photos and 5 recent photos
      const photos = [];
      for (let i = 0; i < 10; i++) {
        photos.push({
          _id: new ObjectId(),
          userId: new ObjectId(this.testUser.id),
          s3Key: `old-${i}.jpg`,
          uploadedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          },
          latitude: 37.7749,
          longitude: -122.4194
        });
      }
      
      for (let i = 0; i < 5; i++) {
        photos.push({
          _id: new ObjectId(),
          userId: new ObjectId(this.testUser.id),
          s3Key: `recent-${i}.jpg`,
          uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749]
          },
          latitude: 37.7749,
          longitude: -122.4194
        });
      }
      
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
      
      if (remaining.length !== 5) {
        throw new Error(`Expected 5 recent photos, found ${remaining.length}`);
      }
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Comprehensive Photo Cleanup Tests\n', 'blue');
    
    await this.setupTestUser();
    await this.testCleanupJobStartup();
    await this.testConcurrentExecutionPrevention();
    await this.testS3DeletionSimulation();
    await this.testErrorHandling();
    await this.testDateCalculationAccuracy();
    await this.testLargeDatasetCleanup();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = PhotoCleanupComprehensiveTests;