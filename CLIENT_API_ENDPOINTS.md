# 🔌 Client API Endpoints Reference

## 📋 **Base Configuration**

```typescript
const API_BASE_URL = 'http://localhost:8081'; // API Gateway
const WS_BASE_URL = 'http://localhost:3003'; // Chat WebSocket
const ADMIN_WS_URL = 'http://localhost:3006'; // Admin WebSocket

const API_HEADERS = {
  'Content-Type': 'application/json',
  'X-API-Key': 'phone-app-api-key-change-in-production'
};

const ADMIN_HEADERS = {
  'Content-Type': 'application/json', 
  'X-Admin-API-Key': 'admin-api-key-change-in-production'
};
```

## 🔐 **Authentication Endpoints**

### **User Registration**
```typescript
POST /auth/register
Headers: X-API-Key
Body: {
  username: string;
  email: string;
  password: string;
}
Response: {
  success: boolean;
  data: {
    userId: string;
    username: string;
    email: string;
    token: string;
    refreshToken: string;
  }
}
```

### **User Login**
```typescript
POST /auth/login
Headers: X-API-Key
Body: {
  email: string;
  password: string;
}
Response: {
  success: boolean;
  data: {
    userId: string;
    username: string;
    email: string;
    token: string;
    refreshToken: string;
  }
}
```

### **Token Refresh**
```typescript
POST /auth/refresh
Headers: X-API-Key, Authorization: Bearer {refreshToken}
Response: {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
  }
}
```

### **Logout**
```typescript
POST /auth/logout
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  message: string;
}
```

## 👤 **User Profile Endpoints**

### **Get User Profile**
```typescript
GET /users/profile
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    userId: string;
    displayName: string;
    bio: string;
    profilePicture: string;
    location: {
      city: string;
      country: string;
    };
    preferences: {
      theme: 'light' | 'dark' | 'auto';
      language: string;
      notifications: {
        push: boolean;
        email: boolean;
        chat: boolean;
      };
    };
  }
}
```

### **Update User Profile**
```typescript
PUT /users/profile
Headers: X-API-Key, Authorization: Bearer {token}
Body: {
  displayName?: string;
  bio?: string;
  location?: {
    city: string;
    country: string;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'auto';
    language?: string;
    notifications?: {
      push?: boolean;
      email?: boolean;
      chat?: boolean;
    };
  };
}
Response: {
  success: boolean;
  data: UserProfile;
}
```

### **Upload Profile Picture**
```typescript
POST /users/profile-picture/upload
Headers: X-API-Key, Authorization: Bearer {token}
Body: FormData {
  profilePicture: File;
}
Response: {
  success: boolean;
  data: {
    profilePicture: string; // URL
    message: string;
  }
}
```

### **Delete Profile Picture**
```typescript
DELETE /users/profile-picture/delete
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    message: string;
  }
}
```

### **Block User**
```typescript
POST /users/block
Headers: X-API-Key, Authorization: Bearer {token}
Body: {
  userId: string;
}
Response: {
  success: boolean;
  message: string;
}
```

### **Unblock User**
```typescript
POST /users/unblock
Headers: X-API-Key, Authorization: Bearer {token}
Body: {
  userId: string;
}
Response: {
  success: boolean;
  message: string;
}
```

## 📸 **Photo Sharing Endpoints**

### **Upload Photo**
```typescript
POST /photos/upload
Headers: X-API-Key, Authorization: Bearer {token}
Body: FormData {
  photo: File;
  latitude: number;
  longitude: number;
  caption?: string;
}
Response: {
  success: boolean;
  data: {
    photoId: string;
    url: string;
    location: {
      latitude: number;
      longitude: number;
    };
    uploadedAt: string;
  }
}
```

### **Get User Photos**
```typescript
GET /photos?page=1&limit=20
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    photos: Array<{
      photoId: string;
      url: string;
      caption: string;
      location: {
        latitude: number;
        longitude: number;
      };
      uploadedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
}
```

### **Get Nearby Photos**
```typescript
GET /photos/nearby?latitude={lat}&longitude={lng}&radius=1000
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    photos: Array<{
      photoId: string;
      url: string;
      caption: string;
      userId: string;
      username: string;
      distance: number; // meters
      uploadedAt: string;
    }>;
  }
}
```

### **Delete Photo**
```typescript
DELETE /photos/{photoId}
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  message: string;
}
```

## 💬 **Chat & Messaging Endpoints**

### **Send Message**
```typescript
POST /chat/send
Headers: X-API-Key, Authorization: Bearer {token}
Body: {
  recipientId: string;
  message: string;
  roomId?: string;
}
Response: {
  success: boolean;
  data: {
    messageId: string;
    status: 'sent' | 'delivered' | 'pending';
    timestamp: string;
  }
}
```

### **Get Pending Messages**
```typescript
GET /chat/pending
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    messages: Array<{
      messageId: string;
      senderId: string;
      senderUsername: string;
      message: string;
      timestamp: string;
      roomId?: string;
    }>;
  }
}
```

### **Mark Message Delivered**
```typescript
POST /chat/delivered/{messageId}
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  message: string;
}
```

### **Cleanup Delivered Message**
```typescript
DELETE /chat/cleanup/{messageId}
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  message: string;
}
```

## 🏠 **Chat Room Management**

### **Create Room**
```typescript
POST /chat/rooms/create
Headers: X-API-Key, Authorization: Bearer {token}
Body: {
  name: string;
  type: 'private' | 'group' | 'public';
  participants?: string[]; // User IDs
}
Response: {
  success: boolean;
  data: {
    roomId: string;
    name: string;
    type: string;
    participants: string[];
    createdBy: string;
    createdAt: string;
  }
}
```

### **Get User Rooms**
```typescript
GET /chat/rooms
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: Array<{
    _id: string;
    name: string;
    type: string;
    participants: string[];
    createdBy: string;
    lastActivity: string;
  }>
}
```

### **Join Room**
```typescript
POST /chat/rooms/{roomId}/join
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    message: string;
    roomId: string;
    participants: string[];
  }
}
```

### **Leave Room**
```typescript
POST /chat/rooms/{roomId}/leave
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    message: string;
    roomId: string;
  }
}
```

### **Add Participant (Admin Only)**
```typescript
POST /chat/rooms/{roomId}/participants
Headers: X-API-Key, Authorization: Bearer {token}
Body: {
  userId: string;
}
Response: {
  success: boolean;
  data: {
    message: string;
    participants: string[];
  }
}
```

### **Remove Participant (Admin Only)**
```typescript
DELETE /chat/rooms/{roomId}/participants/{userId}
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    message: string;
    participants: string[];
  }
}
```

## 🔔 **Notifications Endpoints**

### **Get User Notifications**
```typescript
GET /notifications?page=1&limit=20&unread=true
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  data: {
    notifications: Array<{
      _id: string;
      type: 'message' | 'photo' | 'system';
      title: string;
      message: string;
      isRead: boolean;
      createdAt: string;
      data?: any; // Additional notification data
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      unreadCount: number;
    };
  }
}
```

### **Mark Notification as Read**
```typescript
PUT /notifications/{notificationId}/read
Headers: X-API-Key, Authorization: Bearer {token}
Response: {
  success: boolean;
  message: string;
}
```

### **Send Notification (System)**
```typescript
POST /notifications/send
Headers: X-API-Key, Authorization: Bearer {token}
Body: {
  recipientId: string;
  type: 'message' | 'photo' | 'system';
  title: string;
  message: string;
  data?: any;
}
Response: {
  success: boolean;
  data: {
    notificationId: string;
  }
}
```

## 👨💼 **Admin Endpoints**

### **Admin Login**
```typescript
POST /admin/login
Headers: X-Admin-API-Key
Body: {
  username: string;
  password: string;
}
Response: {
  success: boolean;
  data: {
    adminId: string;
    username: string;
    role: string;
    token: string;
  }
}
```

### **Get All Users**
```typescript
GET /admin/users?page=1&limit=20&status=active&search=username
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Response: {
  success: boolean;
  data: {
    users: Array<{
      userId: string;
      username: string;
      email: string;
      status: 'active' | 'suspended' | 'banned';
      createdAt: string;
      lastLogin: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }
}
```

### **Update User Status**
```typescript
PUT /admin/users/{userId}/status
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Body: {
  status: 'active' | 'suspended' | 'banned';
  reason?: string;
}
Response: {
  success: boolean;
  message: string;
}
```

### **Get Photos for Moderation**
```typescript
GET /admin/photos?status=pending&page=1&limit=20
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Response: {
  success: boolean;
  data: {
    photos: Array<{
      photoId: string;
      url: string;
      userId: string;
      username: string;
      status: 'pending' | 'approved' | 'rejected';
      uploadedAt: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  }
}
```

### **Moderate Photo**
```typescript
PUT /admin/photos/{photoId}/moderate
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Body: {
  action: 'approve' | 'reject';
  reason?: string;
}
Response: {
  success: boolean;
  message: string;
}
```

### **Get System Analytics**
```typescript
GET /admin/analytics?period=7d
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Response: {
  success: boolean;
  data: {
    users: {
      total: number;
      active: number;
      newToday: number;
    };
    photos: {
      total: number;
      pending: number;
      uploadedToday: number;
    };
    reports: {
      total: number;
      pending: number;
      resolvedToday: number;
    };
  }
}
```

### **Real-time Dashboard Data**
```typescript
GET /admin/dashboard/realtime
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Response: {
  success: boolean;
  data: {
    timestamp: string;
    activeUsers: number;
    totalPhotos: number;
    pendingReports: number;
    systemLoad: number;
    memoryUsage: number;
  }
}
```

### **Analytics Charts Data**
```typescript
GET /admin/dashboard/charts/users
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Response: {
  success: boolean;
  data: {
    title: string;
    type: 'line';
    datasets: Array<{
      label: string;
      data: Array<{x: string, y: number}>;
    }>;
  }
}

GET /admin/dashboard/charts/photos
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Response: {
  success: boolean;
  data: {
    title: string;
    type: 'pie';
    datasets: Array<{
      data: number[];
      labels: string[];
      backgroundColor: string[];
    }>;
  }
}

GET /admin/dashboard/charts/reports
Headers: X-Admin-API-Key, Authorization: Bearer {adminToken}
Response: {
  success: boolean;
  data: {
    title: string;
    type: 'bar';
    datasets: Array<{
      label: string;
      data: Array<{x: number, y: number}>;
      backgroundColor: string;
    }>;
  }
}
```

## 🌐 **WebSocket Events**

### **Chat WebSocket (Port 3003)**
```typescript
// Connection
const socket = io('http://localhost:3003', {
  auth: { token: userToken }
});

// Events to Emit
socket.emit('join_room', roomId);
socket.emit('send_message', {
  roomId: string;
  message: string;
});

// Events to Listen
socket.on('new_message', (data) => {
  // Handle incoming message
  console.log(data.message, data.sender, data.timestamp);
});

socket.on('user_joined', (data) => {
  // Handle user joining room
  console.log(data.username, 'joined the room');
});

socket.on('user_left', (data) => {
  // Handle user leaving room
  console.log(data.username, 'left the room');
});
```

### **Admin Dashboard WebSocket (Port 3006)**
```typescript
// Connection
const adminSocket = io('http://localhost:3006', {
  auth: { token: adminToken }
});

// Events to Emit
adminSocket.emit('subscribe_dashboard');

// Events to Listen
adminSocket.on('dashboard_update', (metrics) => {
  // Real-time metrics update (every 5 seconds)
  console.log('Metrics:', metrics);
});

adminSocket.on('dashboard_alert', (alert) => {
  // System alerts and notifications
  console.log('Alert:', alert.message, alert.severity);
});
```

## 🔧 **Error Handling**

### **Standard Error Response**
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

### **Common Error Codes**
- `TOKEN_MISSING` - Authorization header missing
- `INVALID_TOKEN` - JWT token invalid or expired
- `INVALID_API_KEY` - API key missing or invalid
- `INSUFFICIENT_PERMISSIONS` - User lacks required permissions
- `VALIDATION_ERROR` - Request data validation failed
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests

### **HTTP Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📱 **Usage Examples**

### **Complete User Flow**
```typescript
// 1. Register
const registerResponse = await fetch('/auth/register', {
  method: 'POST',
  headers: API_HEADERS,
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// 2. Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: API_HEADERS,
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { token } = loginResponse.data;

// 3. Upload Profile Picture
const formData = new FormData();
formData.append('profilePicture', file);

const uploadResponse = await fetch('/users/profile-picture/upload', {
  method: 'POST',
  headers: {
    'X-API-Key': 'phone-app-api-key-change-in-production',
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

// 4. Create Chat Room
const roomResponse = await fetch('/chat/rooms/create', {
  method: 'POST',
  headers: {
    ...API_HEADERS,
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'My Chat Room',
    type: 'group'
  })
});
```

This comprehensive API reference provides all the endpoints needed to build a full-featured client application that leverages the complete microservices backend functionality.