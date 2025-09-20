const config = {
  services: {
    auth: {
      baseUrl: 'http://localhost:3001',
      endpoints: {
        register: '/auth/register',
        login: '/auth/login',
        refresh: '/auth/refresh',
        verifyToken: '/auth/verify-token',
        logout: '/auth/logout',
        health: '/auth/health'
      }
    },
    photos: {
      baseUrl: 'http://localhost:3002',
      endpoints: {
        upload: '/photos/upload',
        nearby: '/photos/nearby',
        myPhotos: '/photos/my-photos',
        delete: '/photos',
        health: '/photos/health'
      }
    },
    gateway: {
      baseUrl: 'http://localhost:8081',
      endpoints: {
        health: '/health',
        api: '/api'
      }
    }
  },
  database: {
    mongodb: 'mongodb://localhost:27017'
  },
  test: {
    timeout: 10000,
    cleanup: true,
    verbose: true
  },
  fixtures: {
    testUser: {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'TestPassword123'
    },
    testPhoto: {
      latitude: 37.7749,
      longitude: -122.4194,
      caption: 'Test photo from automated test suite'
    }
  }
};

module.exports = config;