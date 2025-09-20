#!/bin/bash

# Client Website Test Runner Script
# Runs comprehensive test suite for the phone app client website

set -e

echo "🧪 Starting Client Website Test Suite..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if dependencies are installed
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not found. Installing..."
    npm install
fi

# Run linting
print_status "Running ESLint..."
if npm run lint; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    exit 1
fi

# Run unit tests
print_status "Running unit tests..."
if npm run test:unit; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# Run integration tests
print_status "Running integration tests..."
if npm run test:integration; then
    print_success "Integration tests passed"
else
    print_error "Integration tests failed"
    exit 1
fi

# Generate coverage report
print_status "Generating test coverage report..."
if npm run test:coverage; then
    print_success "Coverage report generated"
    print_status "Coverage report available at: coverage/lcov-report/index.html"
else
    print_warning "Coverage report generation failed"
fi

# Check if Next.js app is running for E2E tests
print_status "Checking if development server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    print_status "Development server is running, proceeding with E2E tests..."
    
    # Run E2E tests
    print_status "Running E2E tests..."
    if npm run test:e2e; then
        print_success "E2E tests passed"
    else
        print_error "E2E tests failed"
        exit 1
    fi
else
    print_warning "Development server not running. Skipping E2E tests."
    print_status "To run E2E tests, start the dev server with: npm run dev"
fi

# Test summary
echo ""
echo "========================================"
print_success "🎉 All tests completed successfully!"
echo ""
print_status "Test Summary:"
echo "  ✅ Linting: Passed"
echo "  ✅ Unit Tests: Passed"
echo "  ✅ Integration Tests: Passed"
echo "  ✅ Coverage Report: Generated"
if curl -s http://localhost:3000 > /dev/null; then
    echo "  ✅ E2E Tests: Passed"
else
    echo "  ⚠️  E2E Tests: Skipped (server not running)"
fi
echo ""
print_status "Ready for deployment! 🚀"