# 🔒 Admin Service Security Guide

## 🚨 Security Measures Implemented

### **1. Network-Level Protection**
- **IP Whitelisting**: Only allowed IPs can access admin endpoints
- **CORS Restrictions**: Limited to specific origins
- **Helmet Security**: HTTP security headers

### **2. Rate Limiting**
- **Admin Endpoints**: 100 requests per 15 minutes
- **Login Attempts**: 5 attempts per 15 minutes per IP
- **Brute Force Protection**: Automatic blocking

### **3. API Key Authentication**
- **Required Header**: `X-Admin-API-Key`
- **Environment Variable**: `ADMIN_API_KEY`
- **Additional Security Layer**: Beyond JWT tokens

### **4. Environment Configuration**

#### **Production Environment Variables**
```bash
# Required Security Settings
ADMIN_API_KEY=your-secure-api-key-here
ADMIN_ALLOWED_IPS=10.0.0.1,192.168.1.100
ADMIN_ALLOWED_ORIGINS=https://admin.yourapp.com
JWT_SECRET=your-super-secure-jwt-secret

# Optional Settings
NODE_ENV=production
```

#### **Development Settings**
```bash
ADMIN_API_KEY=admin-api-key-change-in-production
ADMIN_ALLOWED_IPS=127.0.0.1,::1,172.18.0.1
ADMIN_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080
```

### **5. Access Control Layers**

1. **IP Whitelist** - Network level filtering
2. **API Key** - Service authentication
3. **JWT Token** - User authentication
4. **Role Check** - Admin/Moderator authorization
5. **Rate Limiting** - Abuse prevention

### **6. Security Headers**
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy
- HTTP Strict Transport Security

## 🛡️ Production Deployment Security

### **Recommended Infrastructure**
1. **VPN Access**: Admin service behind VPN
2. **Firewall Rules**: Restrict port 3006 access
3. **Load Balancer**: SSL termination and DDoS protection
4. **Monitoring**: Failed login attempt alerts

### **Admin Credentials Security**
- Move to secure database with hashed passwords
- Implement multi-factor authentication
- Regular password rotation policy
- Account lockout after failed attempts

### **API Key Management**
- Generate strong, unique API keys
- Rotate keys regularly
- Monitor API key usage
- Revoke compromised keys immediately

## 🔧 Testing Security

### **Security Test Commands**
```bash
# Test without API key (should fail)
curl -X GET http://localhost:3006/admin/users

# Test with API key
curl -X GET http://localhost:3006/admin/users \
  -H "X-Admin-API-Key: admin-api-key-change-in-production"

# Test rate limiting (run multiple times)
for i in {1..10}; do
  curl -X POST http://localhost:3006/admin/login \
    -H "Content-Type: application/json" \
    -H "X-Admin-API-Key: admin-api-key-change-in-production" \
    -d '{"username":"admin","password":"wrong"}'
done
```

## ⚠️ Security Warnings

### **Development vs Production**
- **Development**: Relaxed IP restrictions for testing
- **Production**: Strict IP whitelisting required
- **API Keys**: Must be changed from default values
- **HTTPS**: Required in production (not HTTP)

### **Common Vulnerabilities Addressed**
- ✅ Unauthorized endpoint access
- ✅ Brute force login attacks
- ✅ Cross-origin request abuse
- ✅ DDoS protection
- ✅ Information disclosure
- ✅ Injection attacks (via helmet)

## 🚀 Future Security Enhancements

1. **OAuth2/OIDC Integration**
2. **Certificate-based Authentication**
3. **Audit Log Monitoring**
4. **Intrusion Detection System**
5. **Automated Security Scanning**