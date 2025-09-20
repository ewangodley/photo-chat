#!/bin/bash

echo "🚀 Testing Phone App Services"
echo "================================"

# Test Gateway Health
echo "1. Testing API Gateway..."
curl -s http://localhost:8081/health | jq .

# Test Auth Service Health (direct)
echo -e "\n2. Testing Auth Service (direct)..."
curl -s http://localhost:3001/auth/health | jq .

# Test Photo Service Health (direct)
echo -e "\n3. Testing Photo Service (direct)..."
curl -s http://localhost:3002/photos/health | jq .

# Test User Registration (direct)
echo -e "\n4. Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "password": "Password123"
  }')

echo $REGISTER_RESPONSE | jq .

# Extract token for further tests
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.tokens.accessToken')

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo -e "\n5. Testing Token Verification..."
    curl -s -X POST http://localhost:3001/auth/verify-token \
      -H "Content-Type: application/json" \
      -d "{\"token\": \"$TOKEN\"}" | jq .
    
    echo -e "\n6. Testing Photo Service with Auth..."
    curl -s http://localhost:3002/photos/my-photos \
      -H "Authorization: Bearer $TOKEN" | jq .
else
    echo "❌ Registration failed, skipping authenticated tests"
fi

echo -e "\n✅ Service tests completed!"
echo -e "\n📋 Service Status:"
echo "- API Gateway: http://localhost:8081"
echo "- Auth Service: http://localhost:3001" 
echo "- Photo Service: http://localhost:3002"
echo "- MongoDB: mongodb://localhost:27017"
echo "- MinIO Console: http://localhost:9001 (admin/minioadmin)"