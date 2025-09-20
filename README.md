# Phone App - Modular Location-based Photo Sharing & Chat

A microservices-based application with modular Android client and containerized Node.js services for location-based photo sharing and real-time chat.

## Architecture Overview

Built using **modular architecture** with independent, containerized services and clean separation of concerns.

## Features

- **Location Services**: Display current latitude/longitude
- **User Authentication**: Register/login with username, email, password
- **Photo Sharing**: Upload photos with location data (30-day expiration)
- **Real-time Chat**: WebSocket-based messaging with user blocking
- **User Profiles**: Update profile information and settings
- **Notifications**: In-app notification system
- **Role-based Access Control**: Multi-level user permissions (User, Moderator, Admin)
- **Administrative Dashboard**: System management and content moderation
- **Security**: Encrypted sensitive data transmission
- **Multi-language Support**: Internationalization ready

## Modular Project Structure

```
phone_app/
├── app/                           # Android Client (Modular)
│   ├── src/main/java/com/example/phoneapp/
│   │   ├── features/             # Feature modules
│   │   │   ├── auth/            # Authentication module
│   │   │   ├── location/        # Location services module
│   │   │   ├── photos/          # Photo sharing module
│   │   │   ├── chat/            # Chat module
│   │   │   └── profile/         # User profile module
│   │   ├── core/                # Core shared components
│   │   │   ├── api/             # API interfaces
│   │   │   ├── models/          # Data models
│   │   │   ├── database/        # Local database
│   │   │   └── utils/           # Utilities
│   │   └── di/                  # Dependency injection
│   └── build.gradle
├── services/                      # Backend Microservices
│   ├── auth-service/             # Authentication microservice
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── photo-service/            # Photo management microservice
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── chat-service/             # Real-time chat microservice
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── user-service/             # User profile microservice
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── notification-service/     # Notification microservice
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   └── admin-service/            # Administrative microservice
│       ├── src/
│       ├── Dockerfile
│       └── package.json
├── gateway/                       # API Gateway
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── shared/                        # Shared libraries
│   ├── models/                   # Common data models
│   ├── utils/                    # Shared utilities
│   └── middleware/               # Common middleware
├── infrastructure/                # Infrastructure as Code
│   ├── docker-compose.yml
│   ├── kubernetes/
│   └── terraform/
├── tests/                         # 🚨 MANDATORY: Comprehensive Test Suite
│   ├── server/                   # Server-side API tests (30+ test cases)
│   │   ├── auth-tests.js        # Authentication endpoint tests
│   │   ├── photo-tests.js       # Photo service endpoint tests
│   │   └── gateway-tests.js     # API Gateway tests
│   ├── client/                   # Client-side test templates
│   ├── utils/                    # Test utilities and cleanup
│   └── fixtures/                 # Test data generators
├── run-tests.sh                   # Main test runner script
├── start-all.sh                   # Complete stack startup (services + monitoring)
├── docker-compose.monitoring.yml  # Monitoring stack (Prometheus + Grafana)
├── monitoring/                    # Monitoring configuration
│   ├── prometheus.yml            # Prometheus scraping config
│   └── grafana/                  # Grafana dashboards and datasources
├── TEST_REQUIREMENTS.md           # 🚨 MANDATORY reading for all developers
├── TEST_SUITE_DOCUMENTATION.md    # Comprehensive test documentation
├── DEVELOPMENT_WORKFLOW.md        # Testing-first development workflow
└── docs/
```

## Setup Instructions

### Development Environment
```bash
# Start complete stack (services + monitoring)
./start-all.sh

# Or start services only
docker-compose up -d

# Or start monitoring only
docker-compose -f docker-compose.monitoring.yml up -d

# Or start individual services
cd services/auth-service && npm run dev
cd services/photo-service && npm run dev
cd services/chat-service && npm run dev
```

### Monitoring & Observability
```bash
# Access monitoring dashboards
Prometheus: http://localhost:9090
Grafana: http://localhost:3000 (admin/admin)

# View service metrics
Auth Service: http://localhost:3001/metrics
Photo Service: http://localhost:3002/metrics
Gateway: http://localhost:8081/metrics
```

### Android App
1. Open project in Android Studio
2. Sync Gradle dependencies
3. Configure API endpoints in `core/api/ApiConfig.kt`
4. Run on device/emulator

## Microservices Architecture

### Service Communication
- **API Gateway**: Routes requests to appropriate services
- **Service Discovery**: Consul/Eureka for service registration
- **Message Queue**: Redis/RabbitMQ for async communication
- **Database**: Each service has its own database

### API Endpoints (via Gateway)

#### Authentication Service (`/auth`)
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh

#### User Service (`/users`)
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `POST /users/block` - Block user

#### Photo Service (`/photos`)
- `GET /photos` - Get photos with pagination
- `POST /photos/upload` - Upload photo with location
- `DELETE /photos/:id` - Delete photo
- `GET /photos/nearby` - Get nearby photos

#### Chat Service (`/chat`)
- `GET /chat/rooms` - Get chat rooms
- `GET /chat/messages/:roomId` - Get messages
- `POST /chat/send` - Send message (queued if recipient offline)
- `GET /chat/pending` - Get pending messages for user
- `POST /chat/delivered/:messageId` - Mark message as delivered
- `DELETE /chat/cleanup/:messageId` - Remove delivered message from server
- WebSocket: `/chat/ws` - Real-time messaging and delivery notifications

#### Notification Service (`/notifications`)
- `GET /notifications` - Get user notifications
- `POST /notifications/send` - Send notification
- `PUT /notifications/:id/read` - Mark as read

#### Admin Service (`/admin`) - **Admin/Moderator Only**
- `GET /admin/users` - List all users with filters
- `PUT /admin/users/:id/status` - Update user status (active/suspended/banned)
- `GET /admin/photos` - Review uploaded photos
- `PUT /admin/photos/:id/moderate` - Approve/reject photos
- `DELETE /admin/photos/:id` - Remove inappropriate content
- `GET /admin/reports` - View user reports and complaints
- `PUT /admin/reports/:id/resolve` - Resolve user reports
- `GET /admin/analytics` - System usage analytics
- `GET /admin/logs` - System audit logs
- `POST /admin/announcements` - Send system-wide announcements

## Technology Stack

### Android App (Modular)
- **Language**: Kotlin
- **Architecture**: MVVM + Clean Architecture
- **DI**: Hilt/Dagger
- **Networking**: Retrofit2 + OkHttp
- **Image Loading**: Glide
- **Database**: Room
- **Real-time**: WebSocket/Socket.IO
- **Location**: Google Play Services
- **Navigation**: Navigation Component
- **Testing**: Espresso, JUnit, MockWebServer (see `/tests/client/`)

### Backend Services
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js + Fastify
- **Database**: MongoDB (per service)
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Real-time**: Socket.IO
- **Authentication**: JWT + OAuth2
- **File Storage**: AWS S3/MinIO
- **Monitoring**: Prometheus + Grafana + Winston logging
- **Metrics**: HTTP requests, duration, errors, system resources
- **Testing**: Comprehensive test suite in `/tests/` (30+ test cases)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Orchestration**: Kubernetes
- **API Gateway**: Kong/Nginx
- **Service Mesh**: Istio (optional)
- **CI/CD**: GitHub Actions
- **Infrastructure**: Terraform

## Development Principles

### Modular Design
- **Single Responsibility**: Each service handles one domain
- **Loose Coupling**: Services communicate via APIs
- **High Cohesion**: Related functionality grouped together
- **Independent Deployment**: Services can be deployed separately

### Data Management
- **Database per Service**: Each service owns its data
- **Event Sourcing**: For audit trails and consistency
- **CQRS**: Separate read/write models where needed
- **Eventual Consistency**: Accept temporary inconsistency

### Role-based Access Control
- **User Roles**: User, Moderator, Admin with hierarchical permissions
- **Permission System**: Fine-grained access control per endpoint
- **Admin Dashboard**: Web-based administrative interface
- **Audit Logging**: Complete system activity tracking

### Quality Assurance & Testing
- **🚨 MANDATORY TESTING**: All new code MUST include tests before merge
- **Test Coverage**: 80%+ code coverage, 100% endpoint coverage
- **Test Suite**: Comprehensive automated testing in `/tests/` directory
- **Test Types**: Unit, integration, error scenarios, security testing
- **Test Commands**: `npm test`, `npm run test:auth`, `npm run test:photos`
- **Test Documentation**: `TEST_REQUIREMENTS.md`, `TEST_SUITE_DOCUMENTATION.md`
- **Automated Cleanup**: Tests automatically clean up test data
- **CI/CD Integration**: Tests run automatically in deployment pipeline

## Testing Requirements

**🚨 MANDATORY: All new features MUST include comprehensive tests**

- **Test Coverage**: 100% endpoint coverage, 80%+ code coverage
- **Test Types**: Unit tests, integration tests, error scenarios
- **Test Suite**: Located in `/tests/` directory with automated cleanup
- **Commands**: `npm test`, `npm run test:auth`, `npm run test:photos`
- **Documentation**: See `TEST_REQUIREMENTS.md` and `TEST_SUITE_DOCUMENTATION.md`

**Before merging any code:**
1. Add test cases for new endpoints/features
2. Ensure all tests pass: `npm test`
3. Verify monitoring metrics are exposed: `curl http://localhost:3001/metrics`
4. Verify test cleanup works properly
5. Update test documentation if needed

## Next Steps

1. **Phase 1**: ✅ Implement individual microservices + tests
2. **Phase 2**: ✅ Set up API Gateway and service discovery + tests
3. **Phase 3**: Implement event-driven communication + tests
4. **Phase 4**: ✅ Add monitoring and observability + tests
5. **Phase 5**: Set up CI/CD pipelines with test automation
6. **Phase 6**: Deploy to production environment