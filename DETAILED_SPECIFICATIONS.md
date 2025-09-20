# Phone App - Detailed Technical Specifications

## Database Schemas

### Auth Service - MongoDB Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String (unique, required, 3-30 chars),
  email: String (unique, required, valid email),
  passwordHash: String (bcrypt hashed),
  role: String (enum: ['user', 'moderator', 'admin'], default: 'user'),
  isActive: Boolean (default: true),
  isVerified: Boolean (default: false),
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

#### Sessions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  token: String (JWT token),
  refreshToken: String,
  expiresAt: Date,
  deviceInfo: String,
  ipAddress: String,
  createdAt: Date
}
```

### Photo Service - MongoDB Collections

#### Photos Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  filename: String (S3 key),
  originalName: String,
  mimeType: String,
  size: Number (bytes),
  width: Number,
  height: Number,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  caption: String (max 500 chars),
  isPublic: Boolean (default: true),
  isModerated: Boolean (default: false),
  moderationStatus: String (enum: ['pending', 'approved', 'rejected']),
  moderatedBy: ObjectId (ref: Users),
  moderatedAt: Date,
  tags: [String],
  uploadedAt: Date,
  expiresAt: Date (uploadedAt + 30 days),
  viewCount: Number (default: 0),
  reportCount: Number (default: 0)
}
```

### Chat Service - MongoDB Collections

#### ChatRooms Collection
```javascript
{
  _id: ObjectId,
  type: String (enum: ['private', 'group']),
  participants: [ObjectId] (ref: Users),
  name: String (for group chats),
  description: String,
  createdBy: ObjectId (ref: Users),
  isActive: Boolean (default: true),
  lastMessageAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Messages Collection
```javascript
{
  _id: ObjectId,
  roomId: ObjectId (ref: ChatRooms),
  senderId: ObjectId (ref: Users),
  messageType: String (enum: ['text', 'image', 'location']),
  content: String,
  attachments: [{
    type: String,
    url: String,
    size: Number
  }],
  isEdited: Boolean (default: false),
  editedAt: Date,
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  readBy: [{
    userId: ObjectId (ref: Users),
    readAt: Date
  }],
  sentAt: Date
}
```

#### BlockedUsers Collection
```javascript
{
  _id: ObjectId,
  blockerId: ObjectId (ref: Users),
  blockedId: ObjectId (ref: Users),
  reason: String,
  blockedAt: Date
}
```

### User Service - MongoDB Collections

#### UserProfiles Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users, unique),
  firstName: String,
  lastName: String,
  bio: String (max 500 chars),
  profilePicture: String (S3 URL),
  dateOfBirth: Date,
  location: {
    city: String,
    country: String,
    coordinates: [longitude, latitude]
  },
  preferences: {
    language: String (default: 'en'),
    theme: String (enum: ['light', 'dark', 'auto']),
    notifications: {
      push: Boolean (default: true),
      email: Boolean (default: true),
      chat: Boolean (default: true),
      photos: Boolean (default: true)
    },
    privacy: {
      profileVisibility: String (enum: ['public', 'friends', 'private']),
      locationSharing: Boolean (default: true),
      photoTagging: Boolean (default: true)
    }
  },
  statistics: {
    photosUploaded: Number (default: 0),
    messagesSent: Number (default: 0),
    profileViews: Number (default: 0)
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Service - MongoDB Collections

#### Notifications Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: Users),
  type: String (enum: ['chat', 'photo_like', 'photo_comment', 'system', 'admin']),
  title: String,
  message: String,
  data: Object (additional payload),
  isRead: Boolean (default: false),
  readAt: Date,
  priority: String (enum: ['low', 'normal', 'high']),
  expiresAt: Date,
  createdAt: Date
}
```

### Admin Service - MongoDB Collections

#### AdminLogs Collection
```javascript
{
  _id: ObjectId,
  adminId: ObjectId (ref: Users),
  action: String (enum: ['user_suspend', 'user_ban', 'photo_moderate', 'system_config']),
  targetType: String (enum: ['user', 'photo', 'message', 'system']),
  targetId: ObjectId,
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

#### Reports Collection
```javascript
{
  _id: ObjectId,
  reporterId: ObjectId (ref: Users),
  reportedType: String (enum: ['user', 'photo', 'message']),
  reportedId: ObjectId,
  reportedUserId: ObjectId (ref: Users),
  reason: String (enum: ['spam', 'inappropriate', 'harassment', 'fake', 'other']),
  description: String,
  status: String (enum: ['pending', 'investigating', 'resolved', 'dismissed']),
  assignedTo: ObjectId (ref: Users),
  resolution: String,
  resolvedAt: Date,
  createdAt: Date
}
```

## API Specifications

### Authentication Service Endpoints

#### POST /auth/register
```javascript
// Request
{
  "username": "string (3-30 chars)",
  "email": "string (valid email)",
  "password": "string (8+ chars, 1 upper, 1 lower, 1 number)"
}

// Response 201
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "user",
      "isVerified": false
    },
    "tokens": {
      "accessToken": "string (JWT)",
      "refreshToken": "string",
      "expiresIn": 3600
    }
  }
}

// Error 400
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Username already exists",
    "details": ["username"]
  }
}
```

#### POST /auth/login
```javascript
// Request
{
  "username": "string", // or email
  "password": "string"
}

// Response 200
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "tokens": {
      "accessToken": "string (JWT)",
      "refreshToken": "string",
      "expiresIn": 3600
    }
  }
}
```

### Photo Service Endpoints

#### POST /photos/upload
```javascript
// Request (multipart/form-data)
{
  "image": File,
  "latitude": "number",
  "longitude": "number",
  "caption": "string (optional)",
  "isPublic": "boolean (default: true)"
}

// Response 201
{
  "success": true,
  "data": {
    "photo": {
      "id": "string",
      "url": "string (S3 URL)",
      "thumbnailUrl": "string",
      "location": {
        "latitude": "number",
        "longitude": "number"
      },
      "caption": "string",
      "uploadedAt": "ISO date",
      "expiresAt": "ISO date"
    }
  }
}
```

#### GET /photos/nearby
```javascript
// Query Parameters
{
  "latitude": "number",
  "longitude": "number",
  "radius": "number (meters, default: 1000)",
  "limit": "number (default: 20)",
  "offset": "number (default: 0)"
}

// Response 200
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": "string",
        "url": "string",
        "thumbnailUrl": "string",
        "location": {
          "latitude": "number",
          "longitude": "number"
        },
        "caption": "string",
        "uploadedAt": "ISO date",
        "distance": "number (meters)"
      }
    ],
    "pagination": {
      "total": "number",
      "limit": "number",
      "offset": "number",
      "hasMore": "boolean"
    }
  }
}
```

## Android App Architecture

### Module Structure
```
app/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── repository/AuthRepositoryImpl.kt
│   │   │   ├── remote/AuthApiService.kt
│   │   │   └── local/AuthDao.kt
│   │   ├── domain/
│   │   │   ├── repository/AuthRepository.kt
│   │   │   ├── usecase/LoginUseCase.kt
│   │   │   └── model/User.kt
│   │   └── presentation/
│   │       ├── login/LoginViewModel.kt
│   │       ├── login/LoginFragment.kt
│   │       └── register/RegisterFragment.kt
│   ├── photos/
│   ├── chat/
│   ├── profile/
│   └── location/
├── core/
│   ├── api/
│   │   ├── ApiService.kt
│   │   ├── NetworkModule.kt
│   │   └── AuthInterceptor.kt
│   ├── database/
│   │   ├── AppDatabase.kt
│   │   └── DatabaseModule.kt
│   ├── utils/
│   └── models/
└── di/
    └── AppModule.kt
```

### Key Android Components

#### AuthInterceptor.kt
```kotlin
class AuthInterceptor @Inject constructor(
    private val preferencesManager: PreferencesManager
) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val token = preferencesManager.getAuthToken()
        val request = if (token != null) {
            chain.request().newBuilder()
                .addHeader("Authorization", "Bearer $token")
                .build()
        } else {
            chain.request()
        }
        return chain.proceed(request)
    }
}
```

#### LoginUseCase.kt
```kotlin
class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(username: String, password: String): Result<AuthResponse> {
        return try {
            val response = authRepository.login(username, password)
            Result.success(response)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

## Docker Configuration

### Auth Service Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  api-gateway:
    build: ./gateway
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=development
    depends_on:
      - auth-service
      - photo-service
      - chat-service

  auth-service:
    build: ./services/auth-service
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/auth
      - JWT_SECRET=your-secret-key
    depends_on:
      - mongo
      - redis

  photo-service:
    build: ./services/photo-service
    ports:
      - "3002:3002"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/photos
      - S3_BUCKET=photos-bucket
    depends_on:
      - mongo
      - minio

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minioadmin
      - MINIO_ROOT_PASSWORD=minioadmin
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  mongo_data:
  minio_data:
```

## Environment Variables

### Auth Service (.env)
```
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/auth
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CORS_ORIGIN=http://localhost:3000
```

### Photo Service (.env)
```
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://localhost:27017/photos
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=photos
S3_REGION=us-east-1
MAX_FILE_SIZE=10485760
ALLOWED_MIME_TYPES=image/jpeg,image/png,image/webp
```

## Testing Specifications

**🚨 MANDATORY TESTING POLICY**

**ALL new features, endpoints, and code changes MUST include comprehensive tests before merge.**

### Test Suite Location
- **Full Test Suite**: `/tests/` directory
- **Test Documentation**: `TEST_REQUIREMENTS.md`, `TEST_SUITE_DOCUMENTATION.md`
- **Test Commands**: `npm test`, `npm run test:auth`, `npm run test:photos`

### Required Test Coverage
- **100% Endpoint Coverage**: Every API route must have tests
- **80%+ Code Coverage**: Minimum code coverage threshold
- **Error Scenarios**: All error codes and edge cases tested
- **Security Testing**: Authentication, authorization, input validation
- **Cleanup**: Automated test data cleanup after each run

### Test Implementation Requirements
1. **Add tests BEFORE implementing features**
2. **Follow existing test patterns** in `/tests/server/`
3. **Include positive AND negative test cases**
4. **Test authentication/authorization where applicable**
5. **Ensure tests clean up after themselves**
6. **Verify all tests pass**: `npm test`

### Example Test Implementation
```javascript
// Add to appropriate test file (auth-tests.js, photo-tests.js, etc.)
async testNewFeature() {
  await this.runTest('New Feature Test', async () => {
    const response = await this.helpers.makeRequest(
      'POST', '/new-endpoint', testData, authHeaders
    );
    this.helpers.assertSuccess(response, 201);
    // Add specific assertions for your feature
  });
}

// Add to runAllTests() method
async runAllTests() {
  // ... existing tests
  await this.testNewFeature();
  // ... cleanup
}
```

## Performance Requirements

### Response Time Targets
- Authentication: < 200ms
- Photo upload: < 2s (5MB file)
- Photo retrieval: < 100ms
- Chat message: < 50ms
- Search queries: < 300ms

### Scalability Targets
- Concurrent users: 10,000+
- Photos per day: 100,000+
- Messages per second: 1,000+
- Storage: 1TB+ photos

### Caching Strategy
- Redis for session data (TTL: 1 hour)
- CDN for photo thumbnails
- Application-level caching for user profiles
- Database query result caching (TTL: 5 minutes)

## 🚨 CRITICAL: Testing Requirements

**BEFORE implementing ANY feature described in this specification:**

1. **Review Test Requirements**: Read `TEST_REQUIREMENTS.md` and `TEST_SUITE_DOCUMENTATION.md`
2. **Install Test Suite**: `cd tests && npm install`
3. **Write Tests First**: Add test cases to appropriate test files
4. **Implement Feature**: Code the actual functionality
5. **Verify Tests Pass**: Run `npm test` to ensure all tests pass
6. **Update Documentation**: Update test docs if needed

**Test Coverage Requirements:**
- 100% endpoint coverage
- 80%+ code coverage
- Error scenario testing
- Authentication/authorization testing
- Automated cleanup

**No code will be merged without corresponding tests.**