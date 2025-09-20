# 🧪 Phone App Comprehensive Test Suite

## 📋 **OVERVIEW**

This test suite provides comprehensive testing for the Phone App's server-side and client-side components with automated cleanup, selective endpoint testing, and detailed reporting.

## 🚀 **QUICK START**

### **1. Install Test Dependencies**
```bash
npm run test:install
```

### **2. Start Services**
```bash
npm run services:start
```

### **3. Run All Tests**
```bash
npm test
```

### **4. Run Specific Tests**
```bash
npm run test:auth      # Auth service only
npm run test:photos    # Photo service only
npm run test:gateway   # Gateway only
```

### **5. Cleanup Test Data**
```bash
npm run test:cleanup
```

## 📁 **TEST SUITE STRUCTURE**

```
tests/
├── package.json                 # Test dependencies
├── server/                      # Server-side API tests
│   ├── test-runner.js          # Main test orchestrator
│   ├── auth-tests.js           # Authentication tests (12 test cases)
│   ├── photo-tests.js          # Photo service tests (13 test cases)
│   └── gateway-tests.js        # API Gateway tests (5 test cases)
├── client/                      # Client-side tests
│   └── android-test-template.kt # Android UI test template
├── utils/                       # Test utilities
│   ├── test-config.js          # Configuration and endpoints
│   ├── test-helpers.js         # Common test functions
│   └── cleanup.js              # Database cleanup utility
├── fixtures/                    # Test data generators
│   └── test-image.js           # Image generation for upload tests
└── TEST_REQUIREMENTS.md         # Testing policies and requirements
```

## 🎯 **TEST COVERAGE**

### **Authentication Service (12 Tests)**
- ✅ Health check endpoint
- ✅ User registration with valid data
- ✅ Input validation (username, email, password)
- ✅ Duplicate user prevention
- ✅ User login with valid/invalid credentials
- ✅ JWT token verification
- ✅ Token refresh mechanism
- ✅ User logout functionality

### **Photo Service (13 Tests)**
- ✅ Health check endpoint
- ✅ Photo upload with authentication
- ✅ File validation (size, type, missing file)
- ✅ Coordinate validation (latitude/longitude)
- ✅ User photo retrieval with pagination
- ✅ Nearby photo queries with geospatial search
- ✅ Photo deletion (own photos only)
- ✅ Authorization checks (no auth, wrong user)
- ✅ Pagination limits and validation

### **API Gateway (5 Tests)**
- ✅ Health check endpoint
- ✅ API documentation endpoint
- ✅ Rate limiting functionality
- ✅ 404 error handling
- ✅ CORS headers validation

## 🛠 **COMMAND LINE OPTIONS**

### **Main Test Runner**
```bash
./run-tests.sh [options]

Options:
  --endpoint=<name>   # Run specific endpoint tests (auth, photos, gateway)
  --suite=<name>      # Run specific test suite (server, client)
  --no-cleanup        # Skip database cleanup after tests
  --quiet             # Reduce output verbosity
  --help, -h          # Show help message

Examples:
  ./run-tests.sh                    # Run all server tests
  ./run-tests.sh --endpoint=auth    # Run only auth tests
  ./run-tests.sh --no-cleanup       # Run tests, keep test data
  ./run-tests.sh --quiet            # Minimal output
```

### **NPM Scripts**
```bash
npm test                # Run all tests
npm run test:server     # Server tests only
npm run test:auth       # Auth service tests
npm run test:photos     # Photo service tests
npm run test:gateway    # Gateway tests
npm run test:cleanup    # Clean test data
npm run services:start  # Start Docker services
npm run services:stop   # Stop Docker services
npm run services:logs   # View service logs
```

## 🔧 **TEST FEATURES**

### **Automatic Service Health Checks**
- Verifies all services are running before tests
- Provides clear error messages for unavailable services
- Suggests remediation steps (docker-compose up -d)

### **Intelligent Test Data Management**
- **Unique Data**: Each test uses timestamped usernames/emails
- **Automatic Cleanup**: Tests clean up after themselves
- **Isolated Tests**: No test dependencies or data conflicts
- **Manual Cleanup**: Utility to clean orphaned test data

### **Comprehensive Error Testing**
- **Input Validation**: Tests malformed and invalid inputs
- **Authentication**: Tests unauthorized access attempts
- **Authorization**: Tests access to other users' resources
- **Rate Limiting**: Validates rate limit enforcement
- **File Validation**: Tests invalid file types and sizes

### **Realistic Test Scenarios**
- **Image Generation**: Creates actual image files for upload tests
- **Geospatial Queries**: Tests location-based photo searches
- **Pagination**: Validates limit and offset parameters
- **Token Management**: Tests JWT lifecycle (create, verify, refresh)

## 📊 **TEST REPORTING**

### **Console Output Format**
```
🚀 Phone App Test Suite
========================

🔍 Checking service availability...
✅ Auth Service - Available
✅ Photo Service - Available  
✅ Gateway - Available

🧪 Running Server Tests

🧪 Running: User Registration - Valid Data
✅ User Registration - Valid Data - PASSED

🧪 Running: Photo Upload - Invalid Coordinates  
❌ Photo Upload - Invalid Coordinates - FAILED: Expected status 400, got 500

📊 Test Summary
==================================================
Total Tests: 30
Passed: 28
Failed: 2
Duration: 15.2s

Success Rate: 93.3%

❌ Failed Tests:
  • Photo Upload - Invalid Coordinates: Expected status 400, got 500
  • Token Verification - Invalid Token: Unexpected response format
```

### **Exit Codes**
- **0**: All tests passed
- **1**: Some tests failed or services unavailable

## 🧹 **DATA CLEANUP**

### **Automatic Cleanup (Default)**
- Runs after each test suite completion
- Removes users with test_ prefix patterns
- Removes data created in the last hour
- Cleans associated sessions and photos

### **Manual Cleanup**
```bash
# Clean test data only
npm run test:cleanup

# Or directly
cd tests && node utils/cleanup.js

# Clean all recent data (last hour)
cd tests && node utils/cleanup.js --all
```

### **Cleanup Scope**
- **Users**: test_* usernames, test_* emails, recent registrations
- **Sessions**: Associated JWT sessions and refresh tokens
- **Photos**: Test captions, recent uploads
- **Files**: Uploaded test images from MinIO storage

## 📱 **CLIENT-SIDE TESTING**

### **Android Test Template**
Located at `tests/client/android-test-template.kt`

**Features:**
- Espresso UI test examples
- Authentication flow testing
- Photo upload testing
- Form validation testing
- API mocking patterns

**Setup Requirements:**
```gradle
// Add to app/build.gradle
androidTestImplementation 'androidx.test.ext:junit:1.1.5'
androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
androidTestImplementation 'androidx.test:runner:1.5.2'
testImplementation 'com.squareup.okhttp3:mockwebserver:4.11.0'
```

**Running Android Tests:**
```bash
./gradlew connectedAndroidTest                    # All UI tests
./gradlew test                                    # Unit tests
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=AuthenticationTests
```

## 🔒 **MANDATORY TESTING POLICY**

### **For ALL New Features:**
1. **MUST** add corresponding test cases
2. **MUST** test both success and error scenarios  
3. **MUST** include authentication/authorization tests
4. **MUST** ensure tests pass before code merge
5. **MUST** maintain 80%+ code coverage

### **Test Requirements:**
- **Endpoint Coverage**: 100% of API routes tested
- **Error Handling**: All error codes and edge cases
- **Security**: Authentication, authorization, input validation
- **Performance**: Response time and rate limiting validation

## 🚨 **TROUBLESHOOTING**

### **Common Issues**

**Services Not Running:**
```bash
# Check service status
docker-compose ps

# Start services
docker-compose up -d

# Check logs
docker-compose logs auth-service
```

**Port Conflicts:**
```bash
# Check what's using ports
lsof -i :3001
lsof -i :3002
lsof -i :8081

# Stop conflicting services
docker stop <container-name>
```

**Database Connection Issues:**
```bash
# Check MongoDB
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

**Test Data Conflicts:**
```bash
# Clean up test data
npm run test:cleanup

# Or manual cleanup
cd tests && node utils/cleanup.js
```

### **Debug Mode**
```bash
# Skip cleanup to inspect test data
./run-tests.sh --no-cleanup

# Run single endpoint for focused debugging  
./run-tests.sh --endpoint=auth

# Verbose output for detailed debugging
./run-tests.sh --endpoint=photos
```

## 🔄 **CONTINUOUS INTEGRATION**

### **GitHub Actions Integration**
```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: docker-compose up -d
      - run: npm run test:install
      - run: npm test
      - run: docker-compose down
```

### **Pre-commit Hooks**
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit test hook
npx husky add .husky/pre-commit "npm test"
```

## 📈 **EXTENDING THE TEST SUITE**

### **Adding New Server Tests**

1. **Create test method in appropriate file:**
```javascript
async testNewFeature() {
  await this.runTest('New Feature Test', async () => {
    const response = await this.helpers.makeRequest(
      'POST', 
      '/new-endpoint', 
      testData,
      authHeaders
    );
    this.helpers.assertSuccess(response, 201);
  });
}
```

2. **Add to test suite:**
```javascript
async runAllTests() {
  // ... existing tests
  await this.testNewFeature();
}
```

### **Adding New Client Tests**

1. **Follow Android template patterns**
2. **Include API mocking for isolation**
3. **Add to test runner configuration**
4. **Ensure cleanup procedures**

## 🎯 **BEST PRACTICES**

### **Test Writing Guidelines**
- **Descriptive Names**: Clear test descriptions
- **Independent Tests**: No test dependencies
- **Realistic Data**: Production-like test scenarios
- **Error Coverage**: Test failure paths
- **Clean Teardown**: Always clean up test data

### **Performance Optimization**
- **Service Reuse**: Don't restart services between tests
- **Efficient Cleanup**: Batch database operations
- **Parallel Safety**: Tests designed for sequential execution
- **Minimal Data**: Create only necessary test data

This comprehensive test suite ensures the Phone App maintains high quality, reliability, and security as new features are developed and deployed.