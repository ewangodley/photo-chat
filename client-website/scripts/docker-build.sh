#!/bin/bash

# Build script for Docker deployment
set -e

echo "🐳 Building Phone App Client Website Docker Image..."

# Build production image
docker build -t phone-app-client:latest .

# Tag with version if provided
if [ ! -z "$1" ]; then
    docker tag phone-app-client:latest phone-app-client:$1
    echo "✅ Tagged image as phone-app-client:$1"
fi

echo "✅ Docker image built successfully!"

# Show image info
docker images phone-app-client:latest

echo ""
echo "🚀 To run the container:"
echo "docker run -p 3000:3000 --env-file .env.local phone-app-client:latest"
echo ""
echo "🔧 To run with docker-compose:"
echo "docker-compose up client-website"