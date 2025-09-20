# 🔗 Server Integration Tests

## Overview

These tests verify the client website works correctly with the live microservices backend. Unlike unit tests that use mocks, these tests make real HTTP requests to running services.

## Prerequisites

### 1. Start Microservices Stack
```bash
# From project root
cd /Users/ewangodley/Private/Projects/phone_app
docker-compose up -d
```

### 2. Verify Services Running
- **API Gateway**: http://localhost:8081
- **Auth Service**: http://localhost:3001
- **User Service**: http://localhost:3002
- **Photo Service**: http://localhost:3003
- **Chat Service**: http://localhost:3004
- **Notification Service**: http://localhost:3005
- **Admin Service**: http://localhost:3006

## Test Types

### 1. Direct Server Integration Tests
**File**: `src/test/integration/server-integration.test.ts`

Tests raw HTTP requests to server endpoints:
- User registration and login
- Profile management
- Photo upload/download
- Chat functionality
- Admin operations
- Error handling

```bash
npm run test:server
```

### 2. Client API Layer Tests
**File**: `src/test/integration/client-server-e2e.test.ts`

Tests client's API layer against live server:
- `authApi.login()` with real authentication
- `apiClient.get()` with real data
- Token management and refresh
- Error handling through client layer

```bash
npm run test:e2e-server
```

## Running Tests

### Quick Start
```bash
# Run all server integration tests
./run-server-tests.sh
```

### Individual Test Suites
```bash
# Direct server API tests
npm run test:server

# Client API layer tests  
npm run test:e2e-server

# All integration tests
npm run test:integration
```

## Test Coverage

### Authentication Service
- ✅ User registration with validation
- ✅ Login with valid/invalid credentials
- ✅ Token generation and validation
- ✅ Logout functionality

### User Service
- ✅ Profile retrieval
- ✅ Profile updates
- ✅ Authorization checks

### Photo Service
- ✅ Photo upload with metadata
- ✅ Photo listing with pagination
- ✅ Photo deletion
- ✅ Location-based queries

### Chat Service
- ✅ Room listing
- ✅ Message sending
- ✅ Real-time functionality

### Admin Service
- ✅ User management
- ✅ Content moderation
- ✅ System monitoring
- ✅ Role-based access

## Test Data Management

### Automatic Cleanup
- Tests create unique users with timestamps
- Cleanup runs in `afterAll()` hooks
- No manual data cleanup required

### Test Isolation
- Each test suite uses unique test data
- No dependencies between test runs
- Safe to run multiple times

## Error Scenarios Tested

### Network Errors
- Service unavailable
- Connection timeouts
- Invalid endpoints

### Authentication Errors
- Invalid credentials
- Expired tokens
- Missing authorization

### Validation Errors
- Invalid input data
- Missing required fields
- Format validation

### Authorization Errors
- Insufficient permissions
- Role-based access control
- Admin-only endpoints

## Monitoring Test Results

### Success Indicators
```
✅ All HTTP requests return expected status codes
✅ Response data matches expected format
✅ Authentication flows work end-to-end
✅ CRUD operations complete successfully
✅ Error handling works correctly
```

### Failure Debugging
1. **Check service status**: Ensure all microservices are running
2. **Check logs**: Review Docker container logs for errors
3. **Check network**: Verify port accessibility
4. **Check data**: Ensure test data is valid

## Integration with CI/CD

### GitHub Actions Integration
```yaml
- name: Start Services
  run: docker-compose up -d
  
- name: Wait for Services
  run: sleep 30
  
- name: Run Integration Tests
  run: ./run-server-tests.sh
  
- name: Stop Services
  run: docker-compose down
```

### Local Development
```bash
# Start services in background
docker-compose up -d

# Run tests during development
npm run test:server -- --watch

# Stop services when done
docker-compose down
```

## Benefits

### Full Stack Validation
- Verifies complete request/response cycle
- Tests real database interactions
- Validates service communication
- Confirms deployment readiness

### Realistic Testing
- Uses actual network requests
- Tests real authentication flows
- Validates actual data persistence
- Confirms error handling works in production

### Deployment Confidence
- Ensures services work together
- Validates configuration correctness
- Confirms API compatibility
- Tests production-like scenarios

## Usage Examples

### Running Before Deployment
```bash
# Ensure services are ready for production
./run-server-tests.sh

# If tests pass, deploy with confidence
docker-compose -f docker-compose.prod.yml up -d
```

### Development Workflow
```bash
# Start services
docker-compose up -d

# Make code changes
# ...

# Test changes against live services
npm run test:e2e-server

# Commit when tests pass
git commit -m "Feature complete - integration tests passing"
```

This integration test suite provides comprehensive validation that the client website works correctly with the live microservices backend, ensuring production readiness.