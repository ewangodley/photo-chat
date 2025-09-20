const TestHelpers = require('../utils/test-helpers');
const config = require('../utils/test-config');

class RoomManagementTests {
  constructor() {
    this.helpers = new TestHelpers(config);
    this.testResults = [];
    this.testUser = null;
    this.testRoom = null;
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
    
    const registerResponse = await this.helpers.makeRequest(
      'POST',
      'http://localhost:3001/auth/register',
      userData,
      { 'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production' }
    );
    
    this.helpers.assertSuccess(registerResponse, 201);
    this.testUser = registerResponse.data;
  }

  async testCreateRoom() {
    await this.runTest('Create Room', async () => {
      const roomData = {
        name: 'Test Room',
        type: 'group',
        participants: []
      };

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/rooms/create',
        roomData,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 201);
      
      if (!response.data.roomId) {
        throw new Error('Room ID not returned');
      }
      
      if (response.data.name !== 'Test Room') {
        throw new Error('Invalid room name');
      }
      
      if (!response.data.participants.includes(this.testUser.userId)) {
        throw new Error('Creator not added to participants');
      }
      
      this.testRoom = response.data;
    });
  }

  async testCreateRoomInvalidName() {
    await this.runTest('Create Room - Invalid Name', async () => {
      const roomData = {
        name: '',
        type: 'group'
      };

      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/rooms/create',
        roomData,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertError(response, 400, 'INVALID_ROOM_NAME');
    });
  }

  async testGetUserRooms() {
    await this.runTest('Get User Rooms', async () => {
      const response = await this.helpers.makeRequest(
        'GET',
        'http://localhost:3003/chat/rooms',
        null,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!Array.isArray(response.data)) {
        throw new Error('Rooms data should be an array');
      }
      
      const userRoom = response.data.find(room => room._id === this.testRoom.roomId);
      if (!userRoom) {
        throw new Error('Created room not found in user rooms');
      }
    });
  }

  async testJoinRoom() {
    await this.runTest('Join Room', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        `http://localhost:3003/chat/rooms/${this.testRoom.roomId}/join`,
        null,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      // Should fail because user is already a participant
      this.helpers.assertError(response, 400, 'ALREADY_PARTICIPANT');
    });
  }

  async testJoinNonExistentRoom() {
    await this.runTest('Join Non-existent Room', async () => {
      const fakeRoomId = '507f1f77bcf86cd799439011';
      
      const response = await this.helpers.makeRequest(
        'POST',
        `http://localhost:3003/chat/rooms/${fakeRoomId}/join`,
        null,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertError(response, 404, 'ROOM_NOT_FOUND');
    });
  }

  async testAddParticipant() {
    await this.runTest('Add Participant', async () => {
      const fakeUserId = '507f1f77bcf86cd799439012';
      
      const response = await this.helpers.makeRequest(
        'POST',
        `http://localhost:3003/chat/rooms/${this.testRoom.roomId}/participants`,
        { userId: fakeUserId },
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.participants.includes(fakeUserId)) {
        throw new Error('Participant not added to room');
      }
    });
  }

  async testRemoveParticipant() {
    await this.runTest('Remove Participant', async () => {
      const fakeUserId = '507f1f77bcf86cd799439012';
      
      const response = await this.helpers.makeRequest(
        'DELETE',
        `http://localhost:3003/chat/rooms/${this.testRoom.roomId}/participants/${fakeUserId}`,
        null,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (response.data.participants.includes(fakeUserId)) {
        throw new Error('Participant not removed from room');
      }
    });
  }

  async testLeaveRoom() {
    await this.runTest('Leave Room', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        `http://localhost:3003/chat/rooms/${this.testRoom.roomId}/leave`,
        null,
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production',
          'Authorization': `Bearer ${this.testUser.token}`
        }
      );

      this.helpers.assertSuccess(response, 200);
      
      if (!response.data.message.includes('left room')) {
        throw new Error('Invalid leave room response');
      }
    });
  }

  async testUnauthorizedAccess() {
    await this.runTest('Unauthorized Access', async () => {
      const response = await this.helpers.makeRequest(
        'POST',
        'http://localhost:3003/chat/rooms/create',
        { name: 'Test Room' },
        {
          'X-API-Key': process.env.API_KEY || 'test-api-key-change-in-production'
          // No Authorization header
        }
      );

      this.helpers.assertError(response, 401);
    });
  }

  async runAllTests() {
    this.helpers.log('\n🚀 Starting Room Management Tests\n', 'blue');
    
    await this.setupTestUser();
    await this.testCreateRoom();
    await this.testCreateRoomInvalidName();
    await this.testGetUserRooms();
    await this.testJoinRoom();
    await this.testJoinNonExistentRoom();
    await this.testAddParticipant();
    await this.testRemoveParticipant();
    await this.testLeaveRoom();
    await this.testUnauthorizedAccess();

    if (config.test.cleanup) {
      await this.helpers.cleanup();
    }

    return this.testResults;
  }
}

module.exports = RoomManagementTests;