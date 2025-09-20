#!/bin/bash

echo "🚀 Starting Phone App - Complete Stack"
echo "======================================"

# Start main services
echo "📦 Starting main services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Start monitoring stack
echo "📊 Starting monitoring stack..."
docker-compose -f docker-compose.monitoring.yml up -d

# Wait for monitoring to be ready
echo "⏳ Waiting for monitoring to start..."
sleep 5

echo ""
echo "✅ All services started successfully!"
echo ""
echo "🌐 Access Points:"
echo "=================="
echo "API Gateway:     http://localhost:8081"
echo "Auth Service:    http://localhost:3001"
echo "Photo Service:   http://localhost:3002"
echo "Chat Service:    http://localhost:3003"
echo "User Service:    http://localhost:3004"
echo "Notifications:   http://localhost:3005"
echo "Admin Service:   http://localhost:3006"
echo ""
echo "📊 Monitoring:"
echo "=============="
echo "Prometheus:      http://localhost:9090"
echo "Grafana:         http://localhost:3000 (admin/admin)"
echo ""
echo "📈 Metrics Endpoints:"
echo "===================="
echo "Auth Metrics:    http://localhost:3001/metrics"
echo "Photo Metrics:   http://localhost:3002/metrics"
echo "Gateway Metrics: http://localhost:8081/metrics"
echo ""
echo "🧪 Run Tests:"
echo "============="
echo "npm test                    # All tests"
echo "npm run test:monitoring     # Monitoring tests"
echo "npm run test:auth          # Auth tests"
echo "npm run test:photos        # Photo tests"