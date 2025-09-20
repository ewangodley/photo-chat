# API Contracts and Service Interfaces

## Service Communication Patterns

### Inter-Service Authentication
All internal service calls must include service authentication header:
```
X-Service-Token: <service-jwt-token>
X-Service-Name: <calling-service-name>
```

### Standard Response Format
```javascript
// Success Response
{
  "success": true,
  "data": <response_data>,
  "meta": {
    "timestamp": "ISO-8601",
    "requestId": "uuid",
    "version": "v1"
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": <additional_error_info>,
    "timestamp": "ISO-8601",
    "requestId": "uuid"
  }
}
```

## Auth Service API Contract

### Base URL: `/auth`

#### POST /auth/register
**Purpose**: Register new user account
**Authentication**: None required
**Rate Limit**: 5 requests per minute per IP

```javascript
// Request Body
{
  "username": "string", // 3-30 chars, alphanumeric + underscore
  "email": "string",    // valid email format
  "password": "string"  // min 8 chars, 1 upper, 1 lower, 1 number
}

// Success Response (201)
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "user",
      "isVerified": false,
      "createdAt": "ISO-8601"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string",
      "expiresIn": 3600
    }
  }
}

// Error Responses
// 400 - Validation Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "username": ["Username already exists"],
      "email": ["Invalid email format"],
      "password": ["Password too weak"]
    }
  }
}

// 429 - Rate Limit Exceeded
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many registration attempts",
    "details": {
      "retryAfter": 60
    }
  }
}
```

#### POST /auth/login
**Purpose**: Authenticate user and return tokens
**Authentication**: None required
**Rate Limit**: 10 requests per minute per IP

```javascript
// Request Body
{
  "identifier": "string", // username or email
  "password": "string"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "role": "string",
      "lastLoginAt": "ISO-8601"
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string",
      "expiresIn": 3600
    }
  }
}

// Error Responses
// 401 - Invalid Credentials
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}

// 423 - Account Locked
{
  "success": false,
  "error": {
    "code": "ACCOUNT_LOCKED",
    "message": "Account temporarily locked due to failed login attempts",
    "details": {
      "unlockAt": "ISO-8601"
    }
  }
}
```

#### POST /auth/refresh
**Purpose**: Refresh access token using refresh token
**Authentication**: Refresh token required

```javascript
// Request Body
{
  "refreshToken": "string"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string",
      "expiresIn": 3600
    }
  }
}
```

#### POST /auth/verify-token
**Purpose**: Internal service endpoint to verify JWT tokens
**Authentication**: Service token required

```javascript
// Request Body
{
  "token": "string"
}

// Success Response (200)
{
  "success": true,
  "data": {
    "valid": true,
    "user": {
      "id": "string",
      "username": "string",
      "role": "string"
    },
    "permissions": ["string"]
  }
}
```

## Photo Service API Contract

### Base URL: `/photos`

#### POST /photos/upload
**Purpose**: Upload photo with location data
**Authentication**: Bearer token required
**Rate Limit**: 10 uploads per hour per user
**File Limits**: Max 10MB, JPEG/PNG/WebP only

```javascript
// Request (multipart/form-data)
{
  "image": File,
  "latitude": "number",   // -90 to 90
  "longitude": "number",  // -180 to 180
  "caption": "string",    // optional, max 500 chars
  "isPublic": "boolean"   // default: true
}

// Success Response (201)
{
  "success": true,
  "data": {
    "photo": {
      "id": "string",
      "url": "string",
      "thumbnailUrl": "string",
      "location": {
        "latitude": "number",
        "longitude": "number"
      },
      "caption": "string",
      "isPublic": "boolean",
      "uploadedAt": "ISO-8601",
      "expiresAt": "ISO-8601"
    }
  }
}

// Error Responses
// 413 - File Too Large
{
  "success": false,
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File size exceeds 10MB limit",
    "details": {
      "maxSize": 10485760,
      "receivedSize": 15728640
    }
  }
}

// 415 - Unsupported Media Type
{
  "success": false,
  "error": {
    "code": "UNSUPPORTED_MEDIA_TYPE",
    "message": "Only JPEG, PNG, and WebP images are allowed"
  }
}
```

#### GET /photos/nearby
**Purpose**: Get photos near specified location
**Authentication**: Bearer token required
**Rate Limit**: 100 requests per hour per user

```javascript
// Query Parameters
{
  "latitude": "number",
  "longitude": "number",
  "radius": "number",     // meters, default: 1000, max: 50000
  "limit": "number",      // default: 20, max: 100
  "offset": "number",     // default: 0
  "sort": "string"        // 'distance' | 'recent' | 'popular'
}

// Success Response (200)
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
        "uploadedAt": "ISO-8601",
        "distance": "number",
        "uploader": {
          "id": "string",
          "username": "string"
        }
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

#### DELETE /photos/:id
**Purpose**: Delete user's own photo
**Authentication**: Bearer token required

```javascript
// Success Response (200)
{
  "success": true,
  "data": {
    "message": "Photo deleted successfully"
  }
}

// Error Responses
// 404 - Photo Not Found
{
  "success": false,
  "error": {
    "code": "PHOTO_NOT_FOUND",
    "message": "Photo not found or already deleted"
  }
}

// 403 - Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You can only delete your own photos"
  }
}
```

## Chat Service API Contract

### Base URL: `/chat`

#### GET /chat/rooms
**Purpose**: Get user's chat rooms
**Authentication**: Bearer token required

```javascript
// Query Parameters
{
  "limit": "number",    // default: 50, max: 100
  "offset": "number",   // default: 0
  "type": "string"      // 'private' | 'group' | 'all' (default)
}

// Success Response (200)
{
  "success": true,
  "data": {
    "rooms": [
      {
        "id": "string",
        "type": "private",
        "participants": [
          {
            "id": "string",
            "username": "string",
            "profilePicture": "string"
          }
        ],
        "lastMessage": {
          "id": "string",
          "content": "string",
          "senderId": "string",
          "sentAt": "ISO-8601"
        },
        "unreadCount": "number",
        "updatedAt": "ISO-8601"
      }
    ]
  }
}
```

#### POST /chat/rooms
**Purpose**: Create new chat room
**Authentication**: Bearer token required

```javascript
// Request Body
{
  "type": "private",        // 'private' | 'group'
  "participantIds": ["string"], // user IDs to add
  "name": "string",         // required for group chats
  "description": "string"   // optional
}

// Success Response (201)
{
  "success": true,
  "data": {
    "room": {
      "id": "string",
      "type": "private",
      "participants": [
        {
          "id": "string",
          "username": "string"
        }
      ],
      "createdAt": "ISO-8601"
    }
  }
}
```

#### GET /chat/rooms/:roomId/messages
**Purpose**: Get messages from a chat room
**Authentication**: Bearer token required

```javascript
// Query Parameters
{
  "limit": "number",    // default: 50, max: 100
  "before": "string",   // message ID for pagination
  "after": "string"     // message ID for pagination
}

// Success Response (200)
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "string",
        "senderId": "string",
        "senderUsername": "string",
        "content": "string",
        "messageType": "text",
        "attachments": [],
        "isEdited": false,
        "readBy": [
          {
            "userId": "string",
            "readAt": "ISO-8601"
          }
        ],
        "sentAt": "ISO-8601"
      }
    ],
    "pagination": {
      "hasMore": "boolean",
      "nextCursor": "string"
    }
  }
}
```

#### POST /chat/rooms/:roomId/messages
**Purpose**: Send message to chat room
**Authentication**: Bearer token required

```javascript
// Request Body
{
  "content": "string",      // max 2000 chars
  "messageType": "text",    // 'text' | 'image' | 'location'
  "attachments": [          // optional
    {
      "type": "image",
      "url": "string"
    }
  ]
}

// Success Response (201)
{
  "success": true,
  "data": {
    "message": {
      "id": "string",
      "content": "string",
      "messageType": "text",
      "sentAt": "ISO-8601"
    }
  }
}
```

## WebSocket Events (Chat Service)

### Connection
```javascript
// Client connects with JWT token
socket.auth = {
  token: "jwt-token"
};

// Server acknowledges connection
socket.emit('connected', {
  userId: "string",
  socketId: "string"
});
```

### Join Room
```javascript
// Client joins room
socket.emit('join_room', {
  roomId: "string"
});

// Server confirms join
socket.emit('room_joined', {
  roomId: "string",
  participants: ["string"]
});
```

### Send Message
```javascript
// Client sends message
socket.emit('send_message', {
  roomId: "string",
  content: "string",
  messageType: "text"
});

// Server broadcasts to room participants
socket.to(roomId).emit('new_message', {
  id: "string",
  senderId: "string",
  senderUsername: "string",
  content: "string",
  messageType: "text",
  sentAt: "ISO-8601"
});
```

### Typing Indicators
```javascript
// Client starts typing
socket.emit('typing_start', {
  roomId: "string"
});

// Server broadcasts to room
socket.to(roomId).emit('user_typing', {
  userId: "string",
  username: "string"
});

// Client stops typing
socket.emit('typing_stop', {
  roomId: "string"
});

// Server broadcasts to room
socket.to(roomId).emit('user_stopped_typing', {
  userId: "string"
});
```

## Admin Service API Contract

### Base URL: `/admin`

#### GET /admin/users
**Purpose**: List and search users (Admin/Moderator only)
**Authentication**: Bearer token with admin/moderator role

```javascript
// Query Parameters
{
  "search": "string",       // username or email
  "status": "string",       // 'active' | 'suspended' | 'banned'
  "role": "string",         // 'user' | 'moderator' | 'admin'
  "limit": "number",        // default: 50, max: 100
  "offset": "number",       // default: 0
  "sortBy": "string",       // 'createdAt' | 'lastLoginAt' | 'username'
  "sortOrder": "string"     // 'asc' | 'desc'
}

// Success Response (200)
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "username": "string",
        "email": "string",
        "role": "string",
        "isActive": "boolean",
        "isVerified": "boolean",
        "createdAt": "ISO-8601",
        "lastLoginAt": "ISO-8601",
        "statistics": {
          "photosUploaded": "number",
          "messagesSent": "number",
          "reportsReceived": "number"
        }
      }
    ],
    "pagination": {
      "total": "number",
      "limit": "number",
      "offset": "number"
    }
  }
}
```

#### PUT /admin/users/:userId/status
**Purpose**: Update user status (Admin only)
**Authentication**: Bearer token with admin role

```javascript
// Request Body
{
  "status": "suspended",    // 'active' | 'suspended' | 'banned'
  "reason": "string",       // required for suspension/ban
  "duration": "number"      // days, optional for suspension
}

// Success Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "status": "suspended",
      "suspendedUntil": "ISO-8601"
    }
  }
}
```

#### GET /admin/photos/pending
**Purpose**: Get photos pending moderation
**Authentication**: Bearer token with moderator/admin role

```javascript
// Success Response (200)
{
  "success": true,
  "data": {
    "photos": [
      {
        "id": "string",
        "url": "string",
        "uploaderId": "string",
        "uploaderUsername": "string",
        "caption": "string",
        "uploadedAt": "ISO-8601",
        "reportCount": "number",
        "reports": [
          {
            "reason": "inappropriate",
            "reportedAt": "ISO-8601"
          }
        ]
      }
    ]
  }
}
```

## Error Codes Reference

### Authentication Errors (4xx)
- `INVALID_CREDENTIALS` - Wrong username/password
- `TOKEN_EXPIRED` - JWT token has expired
- `TOKEN_INVALID` - Malformed or invalid JWT
- `ACCOUNT_LOCKED` - Too many failed login attempts
- `ACCOUNT_SUSPENDED` - Account temporarily suspended
- `ACCOUNT_BANNED` - Account permanently banned
- `INSUFFICIENT_PERMISSIONS` - User lacks required role/permissions

### Validation Errors (4xx)
- `VALIDATION_ERROR` - Input validation failed
- `MISSING_REQUIRED_FIELD` - Required field not provided
- `INVALID_FORMAT` - Field format is incorrect
- `VALUE_OUT_OF_RANGE` - Numeric value outside allowed range

### Resource Errors (4xx)
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RESOURCE_ALREADY_EXISTS` - Duplicate resource creation attempt
- `RESOURCE_CONFLICT` - Resource state conflict

### Rate Limiting (4xx)
- `RATE_LIMIT_EXCEEDED` - Too many requests from client
- `QUOTA_EXCEEDED` - User quota limit reached

### Server Errors (5xx)
- `INTERNAL_SERVER_ERROR` - Generic server error
- `SERVICE_UNAVAILABLE` - Service temporarily down
- `DATABASE_ERROR` - Database operation failed
- `EXTERNAL_SERVICE_ERROR` - Third-party service error