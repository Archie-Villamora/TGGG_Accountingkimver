# JWT Authentication Setup Guide

## Overview
This guide explains the JWT (JSON Web Token) authentication setup for the Django REST API with a separate frontend application.

## What Was Configured

### 1. **Installed Packages**
- `djangorestframework-simplejwt` - Provides JWT authentication for Django REST Framework

### 2. **Updated Files**

#### `requirements.txt`
Added:
```
djangorestframework-simplejwt>=5.3.0
```

#### `core/settings.py`
- Added `rest_framework_simplejwt` to `INSTALLED_APPS`
- Configured REST Framework authentication:
  - Default authentication: `JWTAuthentication`
  - Default permission: `IsAuthenticated` (require login for protected endpoints)
- Configured JWT tokens:
  - **Access Token Lifetime**: 15 minutes
  - **Refresh Token Lifetime**: 7 days
  - **Algorithm**: HS256
  - **Signing Key**: Uses Django's SECRET_KEY
- Updated CORS settings:
  - Allowed origins: `localhost:3000`, `localhost:5173`, `127.0.0.1:3000`, `127.0.0.1:5173`
  - Credentials allowed: `True`

#### `core/urls.py`
Added JWT token endpoints:
- `POST /api/token/` - Obtain access and refresh tokens
- `POST /api/token/refresh/` - Refresh expired access token
- `POST /api/token/verify/` - Verify token validity

## How to Use

### 1. **User Login - Obtain Tokens**
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 2. **Access Protected Endpoints**
Include the access token in the `Authorization` header:
```bash
curl -X GET http://localhost:8000/api/accounts/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. **Refresh Expired Token**
When the access token expires, use the refresh token:
```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "YOUR_REFRESH_TOKEN"}'
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### 4. **Verify Token**
```bash
curl -X POST http://localhost:8000/api/token/verify/ \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_ACCESS_TOKEN"}'
```

## Frontend Implementation

### React/Vue Example
```javascript
// Login and store tokens
async function login(username, password) {
  const response = await fetch('http://localhost:8000/api/token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // If CORS_ALLOW_CREDENTIALS is True
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  localStorage.setItem('access_token', data.access);
  localStorage.setItem('refresh_token', data.refresh);
}

// Make authenticated request
async function makeAuthenticatedRequest(url) {
  let token = localStorage.getItem('access_token');
  
  let response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` },
    credentials: 'include'
  });
  
  // If 401, refresh token and retry
  if (response.status === 401) {
    const refreshResponse = await fetch('http://localhost:8000/api/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: localStorage.getItem('refresh_token') })
    });
    
    const data = await refreshResponse.json();
    localStorage.setItem('access_token', data.access);
    token = data.access;
    
    // Retry original request
    response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }
  
  return response;
}

// Logout
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}
```

## API Endpoints Protection

### Protecting Endpoints
Your existing API endpoints in `accounts`, `attendance`, and `payroll` are now automatically protected because:
1. `DEFAULT_PERMISSION_CLASSES` is set to `IsAuthenticated`
2. Requests without valid JWT token will receive `401 Unauthorized`

### Making Endpoints Public (If Needed)
To allow public access to specific endpoints, override the permission class:

```python
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

class PublicView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        return Response({'message': 'This is public'})
```

## Security Considerations

### ✅ Current Configuration
- Access tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- CSRF protection is not needed with JWT
- Tokens are signed with HS256

### ⚠️ Important for Production

1. **Environment Variables** - Update `.env`:
```env
# Change SECRET_KEY to a strong random value
SECRET_KEY=your-very-secret-key-here

# Whitelist only your production domain
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

2. **HTTPS Only** - Ensure JWT tokens are only transmitted over HTTPS

3. **Token Blacklist** (Optional) - Implement token blacklist for logout:
```python
# In requirements.txt, add: djangorestframework-simplejwt[drf_yasg]
# Then implement TokenBlacklistView for logout
```

4. **Custom Claims** - Add user info to token:
```python
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token
```

## Troubleshooting

### CORS Error
- Ensure frontend URL is in `CORS_ALLOWED_ORIGINS`
- Check that `CORS_ALLOW_CREDENTIALS = True` if using cookies

### "Invalid token" Error
- Verify token hasn't expired
- Use refresh endpoint to get new access token
- Check token format: `Authorization: Bearer <token>`

### "Authentication credentials were not provided"
- Token must be in `Authorization` header
- Format: `Bearer <access_token>`
- Check token is valid and not expired

## Next Steps

1. Update your views to use appropriate permission classes
2. Implement user registration endpoint
3. Add password reset functionality
4. Implement token blacklist for logout (optional)
5. Update frontend to handle token refresh automatically
