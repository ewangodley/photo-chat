# Starting the Phone App Services

## Prerequisites

1. **Docker and Docker Compose** installed
2. **Node.js 18+** (for local development)
3. **MongoDB** (if running locally)
4. **Redis** (if running locally)

## Quick Start with Docker Compose

### 1. Start All Services
```bash
# From the project root directory
docker-compose up -d
```

### 2. Check Service Status
```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f auth-service
docker-compose logs -f photo-service
```

### 3. Test the Services
```bash
# Test API Gateway
curl http://localhost:8080/health

# Test Auth Service
curl http://localhost:8080/api/auth/health

# Test Photo Service
curl http://localhost:8080/api/photos/health
```

### 4. Stop Services
```bash
docker-compose down

# Stop and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

## Local Development Setup

### 1. Install Dependencies
```bash
# Auth Service
cd services/auth-service
npm install

# Photo Service
cd ../photo-service
npm install

# API Gateway
cd ../../gateway
npm install
```

### 2. Start Infrastructure Services
```bash
# Start MongoDB, Redis, and MinIO
docker-compose up -d mongo redis minio
```

### 3. Start Services Individually
```bash
# Terminal 1 - Auth Service
cd services/auth-service
npm run dev

# Terminal 2 - Photo Service
cd services/photo-service
npm run dev

# Terminal 3 - API Gateway
cd gateway
npm run dev
```

## Service Endpoints

- **API Gateway**: http://localhost:8081
- **Auth Service**: http://localhost:3001
- **Photo Service**: http://localhost:3002
- **MongoDB**: mongodb://localhost:27017
- **Redis**: redis://localhost:6379
- **MinIO Console**: http://localhost:9001 (admin/minioadmin)

## API Testing Examples

### Register a User
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testuser",
    "password": "Password123"
  }'
```

### Upload Photo (requires auth token)
```bash
curl -X POST http://localhost:3002/photos/upload \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "image=@/path/to/your/image.jpg" \
  -F "latitude=37.7749" \
  -F "longitude=-122.4194" \
  -F "caption=Test photo"
```

### Get Nearby Photos (requires auth token)
```bash
curl "http://localhost:3002/photos/nearby?latitude=37.7749&longitude=-122.4194&radius=1000" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Run All Tests
```bash
./test_services.sh
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the port
   lsof -i :8080
   
   # Kill the process or change the port in docker-compose.yml
   ```

2. **MongoDB Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongo
   
   # Restart MongoDB
   docker-compose restart mongo
   ```

3. **MinIO Access Issues**
   ```bash
   # Check MinIO logs
   docker-compose logs minio
   
   # Access MinIO console at http://localhost:9001
   # Default credentials: minioadmin/minioadmin
   ```

4. **Service Not Responding**
   ```bash
   # Check service logs
   docker-compose logs [service-name]
   
   # Restart specific service
   docker-compose restart [service-name]
   ```

### Health Checks

All services provide health check endpoints:
- Gateway: `GET /health`
- Auth: `GET /auth/health`
- Photos: `GET /photos/health`

### Environment Variables

Key environment variables can be modified in:
- `docker-compose.yml` for containerized deployment
- `.env` files in each service directory for local development

## Next Steps

1. **Implement Chat Service** (port 3003)
2. **Implement User Service** (port 3004)
3. **Implement Notification Service** (port 3005)
4. **Implement Admin Service** (port 3006)
5. **Add monitoring and logging**
6. **Set up CI/CD pipeline**