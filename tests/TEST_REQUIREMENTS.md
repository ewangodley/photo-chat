# Phone App Test Suite Requirements

## 📋 **MANDATORY TESTING POLICY**

### **For ALL New Features/Endpoints:**
1. **MUST** add corresponding test cases to the test suite
2. **MUST** ensure tests pass before merging code
3. **MUST** include both positive and negative test scenarios
4. **MUST** test authentication and authorization where applicable
5. **MUST** include cleanup procedures for any test data created

### **Test Coverage Requirements:**
- **Minimum 80% code coverage** for all services
- **100% endpoint coverage** for all API routes
- **Edge case testing** for all input validation
- **Error handling testing** for all failure scenarios

## 🚀 **Quick Start**

### **Install Test Dependencies**
```bash
cd tests
npm install
```

### **Run All Tests**
```bash
# From project root
npm test

# Or from tests directory
npm run test
```

### **Run Specific Test Suites**
```bash
# Server-side tests only
npm run test:server

# Specific endpoint tests
npm run test:auth
npm run test:photos

# Client-side tests (when implemented)
npm run test:client
```

### **Cleanup Test Data**
```bash
npm run test:cleanup
```

## 📁 **Test Suite Structure**

```
tests/
├── package.json              # Test dependencies
├── server/                   # Server-side API tests
│   ├── test-runner.js       # Main test runner
│   ├── auth-tests.js        # Authentication endpoint tests
│   ├── photo-tests.js       # Photo service endpoint tests
│   └── gateway-tests.js     # API Gateway tests
├── client/                   # Client-side tests
│   ├── android-test-template.kt  # Android UI test template
│   └── test-runner.js       # Client test runner (future)
├── utils/                    # Test utilities
│   ├── test-config.js       # Test configuration
│   ├── test-helpers.js      # Common test functions
│   └── cleanup.js           # Database cleanup utility
└── fixtures/                 # Test data and assets
    ├── test-image.js        # Test image generator
    └── sample-data.json     # Sample test data
```

## 🧪 **Server-Side Testing**

### **Available Test Commands**
```bash
# Run all server tests
node tests/server/test-runner.js

# Run specific endpoint tests
node tests/server/test-runner.js --endpoint=auth
node tests/server/test-runner.js --endpoint=photos
node tests/server/test-runner.js --endpoint=gateway

# Skip cleanup (for debugging)
node tests/server/test-runner.js --no-cleanup

# Quiet mode
node tests/server/test-runner.js --quiet
```

### **Test Categories Covered**

#### **Authentication Tests (`auth-tests.js`)**
- ✅ Health check
- ✅ User registration (valid/invalid data)
- ✅ Duplicate user prevention
- ✅ User login (valid/invalid credentials)
- ✅ JWT token verification
- ✅ Token refresh
- ✅ User logout
- ✅ Input validation and error handling

#### **Photo Tests (`photo-tests.js`)**
- ✅ Health check
- ✅ Photo upload (with/without auth)
- ✅ File validation (size, type, missing file)
- ✅ Coordinate validation
- ✅ User photo retrieval
- ✅ Nearby photo queries
- ✅ Photo deletion (own/others)
- ✅ Pagination limits

#### **Gateway Tests (`gateway-tests.js`)**
- ✅ Health check
- ✅ API documentation endpoint
- ✅ Rate limiting
- ✅ 404 error handling
- ✅ CORS headers

### **Test Data Management**
- **Automatic Cleanup**: Tests clean up after themselves by default
- **Isolated Data**: Each test uses unique usernames/emails with timestamps
- **Database Cleanup**: Removes test users, photos, and sessions
- **Manual Cleanup**: `npm run test:cleanup` for manual cleanup

## 📱 **Client-Side Testing (Android)**

### **Test Template Location**
- `tests/client/android-test-template.kt`

### **Required Dependencies**
```gradle
// Add to app/build.gradle
androidTestImplementation 'androidx.test.ext:junit:1.1.5'
androidTestImplementation 'androidx.test.espresso:espresso-core:3.5.1'
androidTestImplementation 'androidx.test:runner:1.5.2'
androidTestImplementation 'androidx.test:rules:1.5.0'
testImplementation 'com.squareup.okhttp3:mockwebserver:4.11.0'
```

### **Test Categories to Implement**
- **UI Tests**: Screen navigation, form validation, user interactions
- **Integration Tests**: API communication, data persistence
- **Unit Tests**: ViewModels, repositories, utilities
- **Performance Tests**: Memory usage, response times

### **Running Android Tests**
```bash
# UI tests on connected device/emulator
./gradlew connectedAndroidTest

# Unit tests
./gradlew test

# Specific test class
./gradlew connectedAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=com.example.phoneapp.tests.AuthenticationTests
```

## 🔧 **Adding New Tests**

### **For New Server Endpoints**

1. **Add to appropriate test file** (`auth-tests.js`, `photo-tests.js`, etc.)
2. **Follow the test pattern**:
```javascript
async testNewFeature() {
  await this.runTest('New Feature Test', async () => {
    // Setup test data
    const testData = { /* test input */ };
    
    // Make API request
    const response = await this.helpers.makeRequest(
      'POST',
      config.services.auth.baseUrl + '/new-endpoint',
      testData,
      this.helpers.getAuthHeaders(username) // if auth required
    );
    
    // Assert results
    this.helpers.assertSuccess(response, 201);
    
    // Verify response data
    if (!response.data.data.expectedField) {
      throw new Error('Missing expected field');
    }
  });
}
```

3. **Add to test suite**:
```javascript
async runAllTests() {
  // ... existing tests
  await this.testNewFeature();
  // ... cleanup
}
```

### **For New Client Features**

1. **Create test class** in Android test directory
2. **Follow Espresso patterns** from template
3. **Add to test runner** configuration
4. **Include API mocking** for isolated testing

## 📊 **Test Reporting**

### **Console Output**
- ✅ **Green**: Passed tests
- ❌ **Red**: Failed tests  
- ⚠️ **Yellow**: Warnings/cleanup messages
- 🔍 **Blue**: Service availability checks

### **Test Summary**
```
📊 Test Summary
==================================================
Total Tests: 25
Passed: 24
Failed: 1
Duration: 12.3s

Success Rate: 96.0%
```

### **Failed Test Details**
```
❌ Failed Tests:
  • Photo Upload - Invalid Coordinates: Expected status 400, got 500
```

## 🛠 **Debugging Tests**

### **Common Issues**

1. **Services Not Running**
   ```bash
   # Start services first
   docker-compose up -d
   
   # Check service health
   curl http://localhost:3001/auth/health
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB is accessible
   docker-compose logs mongo
   ```

3. **Test Data Conflicts**
   ```bash
   # Clean up test data
   npm run test:cleanup
   ```

4. **Port Conflicts**
   ```bash
   # Check what's using ports
   lsof -i :3001
   lsof -i :3002
   ```

### **Debug Mode**
```bash
# Skip cleanup to inspect test data
node tests/server/test-runner.js --no-cleanup

# Run single endpoint for focused debugging
node tests/server/test-runner.js --endpoint=auth
```

## 📈 **Continuous Integration**

### **GitHub Actions Example**
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
      - run: cd tests && npm install
      - run: npm test
      - run: docker-compose down
```

### **Pre-commit Hooks**
```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit test
npx husky add .husky/pre-commit "npm test"
```

## 🎯 **Best Practices**

### **Test Writing Guidelines**
1. **Descriptive Names**: Test names should clearly describe what's being tested
2. **Independent Tests**: Each test should be able to run independently
3. **Clean Setup/Teardown**: Always clean up test data
4. **Realistic Data**: Use realistic test data that matches production patterns
5. **Error Testing**: Test both success and failure scenarios

### **Performance Considerations**
1. **Parallel Execution**: Tests run sequentially to avoid conflicts
2. **Database Cleanup**: Efficient cleanup to minimize test time
3. **Service Reuse**: Reuse running services rather than restarting
4. **Minimal Data**: Create only the minimum data needed for each test

### **Security Testing**
1. **Authentication**: Test all auth-required endpoints without tokens
2. **Authorization**: Test access control between different users
3. **Input Validation**: Test malformed and malicious inputs
4. **Rate Limiting**: Verify rate limits are enforced

## 🚨 **ENFORCEMENT**

### **Code Review Requirements**
- [ ] All new endpoints have corresponding tests
- [ ] Tests cover both success and error cases
- [ ] Test data is properly cleaned up
- [ ] Tests pass in CI environment
- [ ] Code coverage meets minimum threshold

### **Merge Criteria**
- **All tests must pass** before merging
- **New features must include tests** 
- **Test coverage cannot decrease**
- **Breaking changes must update tests**

This comprehensive test suite ensures the Phone App maintains high quality and reliability as new features are added.