#!/bin/bash

# Phone App Test Suite Runner
# Usage: ./run-tests.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default options
ENDPOINT=""
CLEANUP=true
VERBOSE=true
SUITE="server"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --endpoint=*)
      ENDPOINT="${1#*=}"
      shift
      ;;
    --suite=*)
      SUITE="${1#*=}"
      shift
      ;;
    --no-cleanup)
      CLEANUP=false
      shift
      ;;
    --quiet)
      VERBOSE=false
      shift
      ;;
    --help|-h)
      echo "Phone App Test Suite Runner"
      echo ""
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --endpoint=<name>   Run tests for specific endpoint (auth, photos, gateway)"
      echo "  --suite=<name>      Run specific test suite (server, client)"
      echo "  --no-cleanup        Skip database cleanup after tests"
      echo "  --quiet             Reduce output verbosity"
      echo "  --help, -h          Show this help message"
      echo ""
      echo "Examples:"
      echo "  $0                          # Run all server tests"
      echo "  $0 --endpoint=auth          # Run only auth tests"
      echo "  $0 --suite=client           # Run client tests (when available)"
      echo "  $0 --no-cleanup --quiet     # Run tests without cleanup, minimal output"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 Phone App Test Suite${NC}"
echo -e "${BLUE}========================${NC}"

# Check if services are running
echo -e "${BLUE}🔍 Checking service availability...${NC}"

check_service() {
  local name=$1
  local url=$2
  
  if curl -s --max-time 5 -H "X-API-Key: phone-app-api-key-change-in-production" "$url" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ $name - Available${NC}"
    return 0
  else
    echo -e "${RED}❌ $name - Unavailable${NC}"
    return 1
  fi
}

services_ok=true

if ! check_service "Auth Service" "http://localhost:3001/auth/health"; then
  services_ok=false
fi

if ! check_service "Photo Service" "http://localhost:3002/photos/health"; then
  services_ok=false
fi

if ! check_service "Gateway" "http://localhost:8081/health"; then
  services_ok=false
fi

if [ "$services_ok" = false ]; then
  echo -e "${RED}⚠️  Some services are unavailable${NC}"
  echo -e "${YELLOW}Make sure all services are running with: docker-compose up -d${NC}"
  exit 1
fi

echo -e "${GREEN}✅ All services are available${NC}"
echo ""

# Run tests based on suite
case $SUITE in
  server)
    echo -e "${BLUE}🧪 Running Server Tests${NC}"
    cd tests
    
    # Build command
    cmd="node server/test-runner.js"
    
    if [ -n "$ENDPOINT" ]; then
      cmd="$cmd --endpoint=$ENDPOINT"
    fi
    
    if [ "$CLEANUP" = false ]; then
      cmd="$cmd --no-cleanup"
    fi
    
    if [ "$VERBOSE" = false ]; then
      cmd="$cmd --quiet"
    fi
    
    # Run the tests
    if eval $cmd; then
      echo -e "${GREEN}🎉 All tests passed!${NC}"
      exit 0
    else
      echo -e "${RED}💥 Some tests failed!${NC}"
      exit 1
    fi
    ;;
    
  client)
    echo -e "${YELLOW}📱 Client tests not yet implemented${NC}"
    echo -e "${YELLOW}See tests/client/android-test-template.kt for Android test template${NC}"
    exit 0
    ;;
    
  *)
    echo -e "${RED}Unknown test suite: $SUITE${NC}"
    echo -e "${YELLOW}Available suites: server, client${NC}"
    exit 1
    ;;
esac