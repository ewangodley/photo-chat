# 🚀 Phone App Development Workflow

## 🚨 **MANDATORY TESTING WORKFLOW**

**ALL development MUST follow this testing-first workflow:**

### **1. Before Writing Any Code**
```bash
# Install test dependencies (first time only)
cd tests && npm install

# Verify test suite works
npm test

# Check current test coverage
npm run test:auth    # Test specific services
npm run test:photos
```

### **2. Test-Driven Development Process**

#### **Step 1: Write Tests First**
```bash
# 1. Identify which test file to modify
# - auth-tests.js for authentication features
# - photo-tests.js for photo features  
# - gateway-tests.js for gateway features

# 2. Add test method following existing patterns
# 3. Add test to runAllTests() method
# 4. Run tests to see them fail (red)
npm run test:auth
```

#### **Step 2: Implement Feature**
```bash
# 1. Implement the actual feature/endpoint
# 2. Run tests to see them pass (green)
npm run test:auth

# 3. Refactor if needed while keeping tests green
```

#### **Step 3: Verify Complete Coverage**
```bash
# Run full test suite
npm test

# Verify no regressions
npm run services:logs  # Check for errors
```

### **3. Code Review Requirements**

**Before submitting PR/merge:**
- [ ] All tests pass: `npm test` shows 100% success
- [ ] New features have corresponding tests
- [ ] Tests cover both success and error scenarios
- [ ] Test cleanup works properly
- [ ] No test data left in database after run

### **4. Deployment Workflow**
```bash
# 1. Final test run
npm test

# 2. If tests pass, deploy
npm run services:start

# 3. Run tests against deployed services
npm test

# 4. If production tests pass, deployment is complete
```

## 📋 **Feature Development Checklist**

### **For New API Endpoints**
- [ ] **Test File Updated**: Added tests to appropriate file (chat-tests.js for messaging)
- [ ] **Positive Tests**: Valid input scenarios tested
- [ ] **Negative Tests**: Invalid input, auth failures tested
- [ ] **Error Codes**: All error responses tested
- [ ] **Authentication**: Auth required endpoints tested without tokens
- [ ] **Authorization**: Access control tested (own vs others' data)
- [ ] **Offline Functionality**: Message queuing and delivery tested
- [ ] **Cleanup**: Test data automatically cleaned up
- [ ] **Documentation**: API contracts updated if needed

### **For New Services**
- [ ] **Health Check**: Service health endpoint implemented and tested
- [ ] **Test File Created**: New test file following existing patterns
- [ ] **Database Models**: Model validation tested
- [ ] **Error Handling**: Service-specific errors tested
- [ ] **Integration**: Service integration with gateway tested
- [ ] **Cleanup**: Service-specific cleanup implemented

### **For UI Features (Android)**
- [ ] **Unit Tests**: ViewModel and repository tests
- [ ] **UI Tests**: Espresso tests for user interactions
- [ ] **Integration Tests**: API communication tested
- [ ] **Error Handling**: Network errors and edge cases tested
- [ ] **Mock Data**: Test data and API mocking implemented

## 🛠 **Development Commands**

### **Testing Commands**
```bash
# Run all tests
npm test

# Run specific service tests
npm run test:auth
npm run test:photos
npm run test:gateway

# Clean up test data
npm run test:cleanup

# Install test dependencies
npm run test:install
```

### **Service Management**
```bash
# Start all services
npm run services:start

# Stop all services  
npm run services:stop

# View service logs
npm run services:logs

# View specific service logs
docker-compose logs -f auth-service
```

### **Development Debugging**
```bash
# Run tests without cleanup (for debugging)
./run-tests.sh --no-cleanup

# Run tests with minimal output
./run-tests.sh --quiet

# Run single endpoint tests
./run-tests.sh --endpoint=auth
```

## 🔄 **Git Workflow Integration**

### **Pre-commit Hook Setup**
```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit test hook
npx husky add .husky/pre-commit "npm test"
```

### **Branch Protection Rules**
- All tests must pass before merge
- Require test coverage reports
- Require code review approval
- No direct pushes to main branch

### **CI/CD Pipeline**
```yaml
# .github/workflows/test.yml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: docker-compose up -d
      - run: npm run test:install
      - run: npm test
      - run: docker-compose down
```

## 🚨 **Quality Gates**

### **Code Cannot Be Merged If:**
- Any tests fail
- Test coverage drops below 80%
- New endpoints lack tests
- Tests don't clean up properly
- Breaking changes without test updates

### **Deployment Cannot Proceed If:**
- Test suite fails in any environment
- Performance tests show degradation
- Security tests reveal vulnerabilities
- Integration tests fail

## 📊 **Monitoring Test Health**

### **Daily Test Health Checks**
```bash
# Run full test suite daily
npm test

# Check for flaky tests
npm test && npm test && npm test

# Verify cleanup works
npm run test:cleanup
```

### **Test Maintenance**
- Review test failures immediately
- Update tests when APIs change
- Add tests for reported bugs
- Refactor tests to reduce duplication
- Monitor test execution time

## 🎯 **Best Practices**

### **Test Writing**
- **Descriptive Names**: Test names clearly describe functionality
- **Independent Tests**: No dependencies between tests
- **Realistic Data**: Use production-like test scenarios
- **Error Coverage**: Test all error paths and edge cases
- **Fast Execution**: Keep tests fast and focused

### **Code Quality**
- **Test First**: Write tests before implementation
- **Red-Green-Refactor**: TDD cycle for all features
- **Clean Code**: Refactor while maintaining test coverage
- **Documentation**: Update docs when behavior changes

### **Team Collaboration**
- **Shared Responsibility**: All team members maintain tests
- **Knowledge Sharing**: Document test patterns and utilities
- **Code Reviews**: Review tests as thoroughly as implementation code
- **Continuous Improvement**: Regularly improve test suite quality

This workflow ensures that the Phone App maintains high quality and reliability through comprehensive testing at every stage of development.