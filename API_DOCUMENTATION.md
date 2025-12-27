# 📚 API Documentation - FiveM Tools V7

## Base URL
```
Production: https://fivemtools.net/api
Development: http://localhost:3000/api
```

## Authentication
All authenticated endpoints require a valid session cookie from NextAuth.

```typescript
// Headers
Cookie: next-auth.session-token=<token>
```

---

## 🔐 Authentication Endpoints

### POST `/api/auth/signin`
Sign in with Discord OAuth

**Response:**
```json
{
  "url": "https://discord.com/oauth2/authorize?..."
}
```

### POST `/api/auth/signout`
Sign out current user

**Response:**
```json
{
  "success": true
}
```

---

## 👤 User Endpoints

### GET `/api/user/profile`
Get current user profile

**Auth Required:** Yes

**Response:**
```json
{
  "id": "123456789",
  "username": "user123",
  "email": "user@example.com",
  "avatar": "https://cdn.discordapp.com/...",
  "coins": 1000,
  "membership": "premium",
  "isAdmin": false
}
```

### PATCH `/api/user/profile`
Update user profile

**Auth Required:** Yes

**Body:**
```json
{
  "bio": "My bio text",
  "username": "newusername"
}
```

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

---

## 📦 Asset Endpoints

### GET `/api/assets`
Get all assets with pagination

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `category` (string): Filter by category (scripts|mlo|vehicles|clothing)
- `framework` (string): Filter by framework (esx|qbcore|qbox|standalone)
- `search` (string): Search query

**Response:**
```json
{
  "assets": [
    {
      "id": "uuid",
      "title": "Asset Title",
      "description": "Description",
      "category": "scripts",
      "framework": "qbcore",
      "thumbnail": "https://...",
      "download_url": "https://...",
      "coin_price": 100,
      "downloads": 1500,
      "likes": 250,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 500,
    "totalPages": 25
  }
}
```

### GET `/api/assets/[id]`
Get single asset by ID

**Response:**
```json
{
  "id": "uuid",
  "title": "Asset Title",
  "description": "Full description...",
  "category": "scripts",
  "framework": "qbcore",
  "thumbnail": "https://...",
  "download_url": "https://...",
  "coin_price": 100,
  "downloads": 1500,
  "likes": 250,
  "author": {
    "id": "123",
    "username": "author",
    "avatar": "https://..."
  },
  "created_at": "2025-01-01T00:00:00Z"
}
```

### POST `/api/assets`
Create new asset

**Auth Required:** Yes

**Body:**
```json
{
  "title": "My Script",
  "description": "Description...",
  "category": "scripts",
  "framework": "qbcore",
  "thumbnail": "https://...",
  "download_url": "https://...",
  "coin_price": 100,
  "tags": ["police", "job"]
}
```

**Response:**
```json
{
  "success": true,
  "asset": { ... }
}
```

### PATCH `/api/assets/[id]`
Update asset

**Auth Required:** Yes (Owner or Admin)

**Body:** Same as POST

**Response:**
```json
{
  "success": true,
  "asset": { ... }
}
```

### DELETE `/api/assets/[id]`
Delete asset

**Auth Required:** Yes (Owner or Admin)

**Response:**
```json
{
  "success": true
}
```

---

## 💰 Coins Endpoints

### GET `/api/coins/balance`
Get user coin balance

**Auth Required:** Yes

**Response:**
```json
{
  "coins": 1000
}
```

### POST `/api/coins/daily`
Claim daily coins

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "coins": 50,
  "newBalance": 1050,
  "nextClaim": "2025-01-02T00:00:00Z"
}
```

### POST `/api/coins/purchase`
Purchase asset with coins

**Auth Required:** Yes

**Body:**
```json
{
  "assetId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 900,
  "downloadUrl": "https://..."
}
```

---

## 🎡 Spin Wheel Endpoints

### GET `/api/spin-wheel/prizes`
Get available prizes

**Response:**
```json
{
  "prizes": [
    {
      "id": "uuid",
      "name": "100 Coins",
      "type": "coins",
      "value": 100,
      "probability": 0.3
    }
  ]
}
```

### POST `/api/spin-wheel/spin`
Spin the wheel

**Auth Required:** Yes

**Response:**
```json
{
  "success": true,
  "prize": {
    "id": "uuid",
    "name": "100 Coins",
    "type": "coins",
    "value": 100
  },
  "newBalance": 1100
}
```

---

## 💬 Forum Endpoints

### GET `/api/forum/threads`
Get forum threads

**Query Parameters:**
- `category` (string): Filter by category
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "threads": [
    {
      "id": "uuid",
      "title": "Thread Title",
      "content": "Content...",
      "category": "general",
      "author": { ... },
      "replies_count": 10,
      "views": 150,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### POST `/api/forum/threads`
Create new thread

**Auth Required:** Yes

**Body:**
```json
{
  "title": "My Thread",
  "content": "Content...",
  "category": "general"
}
```

**Response:**
```json
{
  "success": true,
  "thread": { ... }
}
```

### POST `/api/forum/threads/[id]/reply`
Reply to thread

**Auth Required:** Yes

**Body:**
```json
{
  "content": "My reply..."
}
```

**Response:**
```json
{
  "success": true,
  "reply": { ... }
}
```

---

## 🔍 Search Endpoint

### GET `/api/search`
Global search

**Query Parameters:**
- `q` (string): Search query (min 2 chars)
- `limit` (number): Results per category (default: 5)

**Response:**
```json
{
  "results": {
    "assets": [ ... ],
    "threads": [ ... ],
    "users": [ ... ]
  }
}
```

---

## 📊 Stats Endpoints

### GET `/api/stats`
Get site statistics

**Response:**
```json
{
  "totalAssets": 5000,
  "totalUsers": 10000,
  "totalDownloads": 50000,
  "totalThreads": 1000
}
```

---

## 🔔 Notification Endpoints

### GET `/api/notifications`
Get user notifications

**Auth Required:** Yes

**Response:**
```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "like",
      "message": "User liked your asset",
      "read": false,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

### PATCH `/api/notifications/[id]/read`
Mark notification as read

**Auth Required:** Yes

**Response:**
```json
{
  "success": true
}
```

---

## 🛡️ Admin Endpoints

### GET `/api/admin/users`
Get all users (Admin only)

**Auth Required:** Yes (Admin)

**Response:**
```json
{
  "users": [ ... ],
  "pagination": { ... }
}
```

### PATCH `/api/admin/users/[id]`
Update user (Admin only)

**Auth Required:** Yes (Admin)

**Body:**
```json
{
  "coins": 1000,
  "membership": "premium",
  "isAdmin": false
}
```

### DELETE `/api/admin/assets/[id]`
Delete any asset (Admin only)

**Auth Required:** Yes (Admin)

---

## ⚠️ Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

### Common Error Codes:
- `UNAUTHORIZED` (401): Not authenticated
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Invalid input
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## 🔒 Rate Limits

- **Anonymous**: 10 requests/minute
- **Authenticated**: 100 requests/minute
- **Admin**: 200 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-01-01T00:01:00Z
```

---

## 📝 Notes

1. All timestamps are in ISO 8601 format (UTC)
2. All IDs are UUIDs
3. File uploads use multipart/form-data
4. Maximum request body size: 10MB
5. CORS enabled for fivemtools.net

---

**Version**: 7.0.0  
**Last Updated**: 2025-01-XX
