# 🌐 Client Website Implementation Guide

## 📋 **Overview**

This document outlines the implementation of a public-facing web client that interfaces with the Phone App microservices backend. The website provides two distinct user experiences: **Admin Dashboard** for system management and **User Portal** for social features.

## 🏗️ **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Website (React/Next.js)           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │   Admin Portal  │    │        User Portal              │ │
│  │                 │    │                                 │ │
│  │ • Dashboard     │    │ • Profile Management           │ │
│  │ • Analytics     │    │ • Photo Sharing                │ │
│  │ • Monitoring    │    │ • Chat & Rooms                 │ │
│  │ • User Mgmt     │    │ • Location Services            │ │
│  │ • System Health │    │ • Notifications                │ │
│  └─────────────────┘    └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Port 8081)                  │
├─────────────────────────────────────────────────────────────┤
│  Routes requests to appropriate microservices               │
│  • Authentication & Authorization                           │
│  • Rate Limiting & CORS                                     │
│  • API Key Management                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Microservices Backend                   │
│                                                             │
│  Auth Service    User Service    Chat Service              │
│  Photo Service   Notification    Admin Service             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 **Technology Stack**

> **🎨 UI/UX STANDARDS**: The user interface will be **modern, professional, and adhere to the latest design standards** including Material Design 3, Apple Human Interface Guidelines, and Web Content Accessibility Guidelines (WCAG 2.1 AA).
>
> **🐳 DOCKER DEPLOYMENT**: The website will be **fully containerized using Docker** with multi-stage builds for production optimization, development containers with hot reload, and complete Docker Compose integration for seamless deployment alongside the microservices backend.

### **Frontend Framework**
- **React 18** with TypeScript
- **Next.js 14** for SSR/SSG and routing
- **Tailwind CSS** for styling
- **Shadcn/ui** for component library

### **State Management**
- **Zustand** for global state
- **React Query** for server state
- **Socket.IO Client** for real-time features

### **Authentication**
- **JWT tokens** with refresh mechanism
- **Role-based access control** (User/Admin)
- **Protected routes** and components

### **Modern UI/UX Design System**
- **Material Design 3** principles and components
- **Apple Human Interface Guidelines** compliance
- **WCAG 2.1 AA** accessibility standards
- **Modern CSS Grid & Flexbox** layouts
- **Responsive Design** with mobile-first approach
- **Dark/Light Mode** theme support
- **Smooth Animations** and micro-interactions
- **Professional Typography** with system fonts

### **Real-time Features**
- **Socket.IO** for chat and notifications
- **WebSocket** connections for admin dashboard
- **Live updates** for analytics and monitoring

## 📁 **Project Structure**

```
client-website/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (admin)/                  # Admin routes group
│   │   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   ├── users/
│   │   │   ├── monitoring/
│   │   │   └── layout.tsx
│   │   ├── (user)/                   # User routes group
│   │   │   ├── profile/
│   │   │   ├── chat/
│   │   │   ├── photos/
│   │   │   └── layout.tsx
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── admin/                    # Admin-specific components
│   │   │   ├── Dashboard/
│   │   │   ├── Analytics/
│   │   │   ├── UserManagement/
│   │   │   └── SystemMonitoring/
│   │   ├── user/                     # User-specific components
│   │   │   ├── Profile/
│   │   │   ├── Chat/
│   │   │   ├── Photos/
│   │   │   └── Notifications/
│   │   ├── shared/                   # Shared components
│   │   │   ├── Layout/
│   │   │   ├── Auth/
│   │   │   └── UI/
│   │   └── ui/                       # Shadcn components
│   ├── lib/
│   │   ├── api/                      # API client functions
│   │   ├── auth/                     # Authentication utilities
│   │   ├── socket/                   # WebSocket connections
│   │   └── utils/                    # Helper functions
│   ├── hooks/                        # Custom React hooks
│   ├── stores/                       # Zustand stores
│   └── types/                        # TypeScript definitions
├── public/
├── package.json
└── next.config.js
```

## 🔐 **Authentication System**

### **JWT Token Management**
```typescript
// lib/auth/tokenManager.ts
export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  static setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }
  
  static getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }
  
  static clearTokens() {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }
}
```

### **Role-Based Access Control**
```typescript
// lib/auth/rbac.ts
export enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator', 
  ADMIN = 'admin'
}

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy = {
    [UserRole.USER]: 0,
    [UserRole.MODERATOR]: 1,
    [UserRole.ADMIN]: 2
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
```

### **Protected Route Component**
```typescript
// components/shared/Auth/ProtectedRoute.tsx
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = UserRole.USER,
  fallback = <LoginRedirect />
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!user) return fallback;
  if (!hasPermission(user.role, requiredRole)) return <UnauthorizedPage />;
  
  return <>{children}</>;
};
```

## 🌐 **API Integration**

### **API Client Configuration**
```typescript
// lib/api/client.ts
class ApiClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';
  private apiKey = process.env.NEXT_PUBLIC_API_KEY;
  
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = TokenManager.getAccessToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    };
    
    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (response.status === 401) {
      await this.refreshToken();
      return this.request(endpoint, options);
    }
    
    if (!response.ok) {
      throw new ApiError(response.status, await response.json());
    }
    
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

### **Service-Specific API Functions**
```typescript
// lib/api/services/auth.ts
export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    
  register: (userData: RegisterData) =>
    apiClient.request<AuthResponse>('/auth/register', {
      method: 'POST', 
      body: JSON.stringify(userData)
    }),
    
  refreshToken: () =>
    apiClient.request<TokenResponse>('/auth/refresh', {
      method: 'POST'
    })
};

// lib/api/services/user.ts
export const userApi = {
  getProfile: () =>
    apiClient.request<UserProfile>('/users/profile'),
    
  updateProfile: (data: Partial<UserProfile>) =>
    apiClient.request<UserProfile>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    
  uploadProfilePicture: (file: File) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    return apiClient.request<UploadResponse>('/users/profile-picture/upload', {
      method: 'POST',
      body: formData,
      headers: {} // Let browser set Content-Type for FormData
    });
  }
};
```

## 👤 **User Portal Implementation**

### **User Dashboard Layout**
```typescript
// app/(user)/layout.tsx
export default function UserLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={UserRole.USER}>
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <NotificationToast />
      </div>
    </ProtectedRoute>
  );
}
```

### **Profile Management Component**
```typescript
// components/user/Profile/ProfileManager.tsx
export const ProfileManager: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: uploadPicture } = useProfilePictureUpload();
  
  const handlePictureUpload = (file: File) => {
    uploadPicture(file, {
      onSuccess: (data) => {
        updateProfile({ profilePicture: data.profilePicture });
        toast.success('Profile picture updated!');
      }
    });
  };
  
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <ProfilePictureUpload 
          currentPicture={user?.profilePicture}
          onUpload={handlePictureUpload}
        />
        <ProfileForm 
          user={user}
          isEditing={isEditing}
          onSave={updateProfile}
          onToggleEdit={() => setIsEditing(!isEditing)}
        />
      </CardContent>
    </Card>
  );
};
```

### **Chat System Implementation**
```typescript
// components/user/Chat/ChatInterface.tsx
export const ChatInterface: React.FC = () => {
  const { socket } = useSocket();
  const { data: rooms } = useUserRooms();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const { messages, sendMessage } = useChatMessages(activeRoom);
  
  useEffect(() => {
    if (activeRoom && socket) {
      socket.emit('join_room', activeRoom);
    }
  }, [activeRoom, socket]);
  
  return (
    <div className="flex h-[600px] border rounded-lg">
      <RoomList 
        rooms={rooms}
        activeRoom={activeRoom}
        onRoomSelect={setActiveRoom}
      />
      <div className="flex-1 flex flex-col">
        <MessageList messages={messages} />
        <MessageInput onSend={sendMessage} />
      </div>
    </div>
  );
};
```

### **Photo Sharing Component**
```typescript
// components/user/Photos/PhotoGallery.tsx
export const PhotoGallery: React.FC = () => {
  const { data: photos, isLoading } = useUserPhotos();
  const { mutate: uploadPhoto } = usePhotoUpload();
  const { location } = useGeolocation();
  
  const handlePhotoUpload = (file: File) => {
    if (!location) {
      toast.error('Location access required for photo upload');
      return;
    }
    
    uploadPhoto({
      file,
      latitude: location.latitude,
      longitude: location.longitude
    });
  };
  
  return (
    <div className="space-y-6">
      <PhotoUploadZone onUpload={handlePhotoUpload} />
      <PhotoGrid photos={photos} isLoading={isLoading} />
    </div>
  );
};
```

## 👨‍💼 **Admin Portal Implementation**

### **Admin Dashboard Layout**
```typescript
// app/(admin)/layout.tsx
export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute requiredRole={UserRole.ADMIN}>
      <div className="min-h-screen bg-gray-100">
        <AdminSidebar />
        <div className="ml-64">
          <AdminHeader />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

### **Real-time Dashboard**
```typescript
// components/admin/Dashboard/RealTimeDashboard.tsx
export const RealTimeDashboard: React.FC = () => {
  const { socket } = useAdminSocket();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  
  useEffect(() => {
    if (socket) {
      socket.emit('subscribe_dashboard');
      
      socket.on('dashboard_update', (data: DashboardMetrics) => {
        setMetrics(data);
      });
      
      socket.on('dashboard_alert', (alert: SystemAlert) => {
        toast.warning(alert.message);
      });
    }
  }, [socket]);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard 
        title="Active Users"
        value={metrics?.activeUsers}
        trend={metrics?.userTrend}
      />
      <MetricCard 
        title="Total Photos"
        value={metrics?.totalPhotos}
        trend={metrics?.photoTrend}
      />
      <MetricCard 
        title="Pending Reports"
        value={metrics?.pendingReports}
        alert={metrics?.pendingReports > 10}
      />
      <MetricCard 
        title="System Load"
        value={`${metrics?.systemLoad}%`}
        alert={metrics?.systemLoad > 80}
      />
    </div>
  );
};
```

### **Analytics Charts**
```typescript
// components/admin/Analytics/AnalyticsCharts.tsx
import { Line, Pie, Bar } from 'react-chartjs-2';

export const AnalyticsCharts: React.FC = () => {
  const { data: userChartData } = useChartData('users');
  const { data: photoChartData } = useChartData('photos');
  const { data: reportChartData } = useChartData('reports');
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <Line 
            data={userChartData}
            options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Photo Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <Pie 
            data={photoChartData}
            options={{ responsive: true }}
          />
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Reports Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <Bar 
            data={reportChartData}
            options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};
```

### **System Monitoring**
```typescript
// components/admin/Monitoring/SystemMonitoring.tsx
export const SystemMonitoring: React.FC = () => {
  const { data: serviceHealth } = useServiceHealth();
  const { data: systemMetrics } = useSystemMetrics();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Service Health Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {serviceHealth?.map((service) => (
              <ServiceHealthCard 
                key={service.name}
                service={service}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <MetricsGrid metrics={systemMetrics} />
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🔌 **Real-time Features**

### **Socket.IO Integration**
```typescript
// lib/socket/socketManager.ts
class SocketManager {
  private socket: Socket | null = null;
  
  connect(namespace: string = '/', token?: string) {
    this.socket = io(`${process.env.NEXT_PUBLIC_WS_URL}${namespace}`, {
      auth: { token },
      transports: ['websocket']
    });
    
    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });
    
    this.socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket');
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketManager = new SocketManager();
```

### **Chat WebSocket Hook**
```typescript
// hooks/useSocket.ts
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user?.token) {
      const socketInstance = socketManager.connect('/chat', user.token);
      setSocket(socketInstance);
      
      return () => {
        socketManager.disconnect();
        setSocket(null);
      };
    }
  }, [user]);
  
  return { socket };
};
```

## 📱 **Responsive Design**

### **Mobile-First Approach**
```typescript
// components/shared/Layout/ResponsiveLayout.tsx
export const ResponsiveLayout: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <div className={cn(
      "min-h-screen",
      isMobile ? "mobile-layout" : "desktop-layout"
    )}>
      {children}
    </div>
  );
};
```

## 🚀 **Deployment Configuration**

### **Environment Variables**
```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.phoneapp.com
NEXT_PUBLIC_WS_URL=wss://ws.phoneapp.com
NEXT_PUBLIC_API_KEY=your-api-key
NEXT_PUBLIC_ADMIN_API_KEY=your-admin-api-key
```

### **Next.js Configuration**
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['your-s3-bucket.s3.amazonaws.com'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
```

### **Docker Configuration**
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

## 📋 **Implementation Checklist**

### **Phase 1: Foundation (Week 1-2)**
- [ ] Set up Next.js project with TypeScript
- [ ] Configure Tailwind CSS and Shadcn/ui
- [ ] Implement authentication system
- [ ] Create API client and service functions
- [ ] Set up protected routes and RBAC

### **Phase 2: User Portal (Week 3-4)**
- [ ] Build user registration/login flows
- [ ] Implement profile management
- [ ] Create photo upload and gallery
- [ ] Build chat interface and room management
- [ ] Add notification system

### **Phase 3: Admin Portal (Week 5-6)**
- [ ] Create admin dashboard layout
- [ ] Implement real-time metrics display
- [ ] Build analytics charts with Chart.js
- [ ] Add user management interface
- [ ] Create system monitoring dashboard

### **Phase 4: Real-time Features (Week 7)**
- [ ] Integrate Socket.IO for chat
- [ ] Add WebSocket for admin dashboard
- [ ] Implement live notifications
- [ ] Add real-time status updates

### **Phase 5: Polish & Deploy (Week 8)**
- [ ] Responsive design optimization
- [ ] Performance optimization
- [ ] Error handling and loading states
- [ ] Testing and bug fixes
- [ ] Production deployment

## 🔒 **Security Considerations**

### **Client-Side Security**
- **Token Storage**: Use secure HTTP-only cookies for production
- **XSS Protection**: Sanitize all user inputs
- **CSRF Protection**: Implement CSRF tokens for state-changing operations
- **Content Security Policy**: Configure CSP headers

### **API Security**
- **Rate Limiting**: Implement client-side rate limiting
- **Input Validation**: Validate all inputs before API calls
- **Error Handling**: Don't expose sensitive error information
- **HTTPS Only**: Enforce HTTPS in production

## 📊 **Performance Optimization**

### **Code Splitting**
```typescript
// Dynamic imports for large components
const AdminDashboard = dynamic(() => import('@/components/admin/Dashboard'), {
  loading: () => <DashboardSkeleton />
});

const ChatInterface = dynamic(() => import('@/components/user/Chat'), {
  loading: () => <ChatSkeleton />
});
```

### **Image Optimization**
```typescript
// components/shared/OptimizedImage.tsx
import Image from 'next/image';

export const OptimizedImage: React.FC<ImageProps> = ({
  src,
  alt,
  ...props
}) => {
  return (
    <Image
      src={src}
      alt={alt}
      loading="lazy"
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
      {...props}
    />
  );
};
```

## 🧪 **Testing Strategy**

### **Unit Testing**
```typescript
// __tests__/components/ProfileManager.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileManager } from '@/components/user/Profile/ProfileManager';

describe('ProfileManager', () => {
  it('should upload profile picture', async () => {
    render(<ProfileManager />);
    
    const fileInput = screen.getByLabelText(/upload picture/i);
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(screen.getByText(/uploading/i)).toBeInTheDocument();
  });
});
```

### **Integration Testing**
```typescript
// __tests__/api/auth.test.ts
import { authApi } from '@/lib/api/services/auth';

describe('Auth API', () => {
  it('should login successfully', async () => {
    const credentials = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await authApi.login(credentials);
    
    expect(response.success).toBe(true);
    expect(response.token).toBeDefined();
  });
});
```

This implementation guide provides a comprehensive foundation for building a modern, scalable web client that fully utilizes all the microservices backend capabilities while maintaining security, performance, and user experience best practices.