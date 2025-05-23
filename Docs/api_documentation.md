# LegionX API Documentation

## Base URL
```
http://localhost:3000/api/v1
```

## Development Environment
For local development, the API is available at `http://localhost:3000/api/v1`. Make sure to:
1. Have the backend server running locally
2. Set up your environment variables in `.env` file
3. Configure CORS if needed for local development

## Production URL
When deployed to production, the API will be available at:
```
https://api.legionx.com/v1
```

## Health Check

### 1. Check API Status
```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

## Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## API Endpoints

### Authentication

#### 1. Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "wallet": "0x1234...5678"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "wallet": "0x1234...5678"
  }
}
```

#### 2. Wallet Login
```http
POST /auth/login/wallet
```

**Request Body:**
```json
{
  "wallet": "0x1234...5678"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "wallet": "0x1234...5678"
  }
}
```

#### 3. Link Wallet
```http
POST /auth/link-wallet
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "wallet": "0x1234...5678"
}
```

**Response:**
```json
{
  "message": "Wallet linked successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "wallet": "0x1234...5678"
  }
}
```

#### 4. Verify Token
```http
GET /auth/verify
```

**Response:**
```json
{
  "message": "Token is valid",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "wallet": "0x1234...5678"
  }
}
```

#### 5. Get User Profile
```http
GET /auth/profile
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "username": "user123",
    "email": "user@example.com",
    "wallet": "0x1234...5678",
    "hasAnalyticsAccess": false,
    "analyticsExpiry": null,
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
}
```

### Listings

#### 1. Create Listing
```http
POST /listings
```

**Request Body:**
```json
{
  "title": "AI Content Generator",
  "description": "Advanced AI model for content generation",
  "price": 99.99,
  "type": "llm",
  "features": [
    "Content generation",
    "SEO optimization",
    "Multiple languages"
  ],
  "requirements": {
    "minTokens": 1000,
    "apiKey": true
  },
  "images": ["image1.jpg", "image2.jpg"]
}
```

**Response:**
```json
{
  "id": "listing_123",
  "title": "AI Content Generator",
  "description": "Advanced AI model for content generation",
  "price": 99.99,
  "type": "llm",
  "features": [
    "Content generation",
    "SEO optimization",
    "Multiple languages"
  ],
  "requirements": {
    "minTokens": 1000,
    "apiKey": true
  },
  "images": ["image1.jpg", "image2.jpg"],
  "seller": {
    "id": "user_123",
    "username": "user123"
  },
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}
```

#### 2. Get Listings
```http
GET /listings
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `type` (string, optional)
- `minPrice` (number, optional)
- `maxPrice` (number, optional)
- `search` (string, optional)

**Response:**
```json
{
  "listings": [
    {
      "id": "listing_123",
      "title": "AI Content Generator",
      "description": "Advanced AI model for content generation",
      "price": 99.99,
      "type": "llm",
      "images": ["image1.jpg"],
      "seller": {
        "id": "user_123",
        "username": "user123"
      },
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

### Purchases

#### 1. Create Purchase
```http
POST /purchases
```

**Request Body:**
```json
{
  "listingId": "listing_123",
  "paymentMethod": "wallet"
}
```

**Response:**
```json
{
  "id": "purchase_123",
  "listing": {
    "id": "listing_123",
    "title": "AI Content Generator",
    "price": 99.99
  },
  "buyer": {
    "id": "user_123",
    "username": "user123"
  },
  "status": "pending",
  "amount": 99.99,
  "txHash": null,
  "confirmations": null,
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}
```

#### 2. Get Purchase
```http
GET /purchases/:id
```

**Response:**
```json
{
  "id": "purchase_123",
  "listing": {
    "id": "listing_123",
    "title": "AI Content Generator",
    "price": 99.99,
    "seller": {
      "id": "user_123",
      "username": "user123"
    }
  },
  "buyer": {
    "id": "user_123",
    "username": "user123"
  },
  "status": "completed",
  "amount": 99.99,
  "txHash": "0xabc...def",
  "confirmations": 3,
  "createdAt": "2024-03-20T10:00:00Z",
  "updatedAt": "2024-03-20T10:00:00Z"
}
```

#### 3. Update Purchase
```http
PUT /purchases/:id
```

**Request Body:**
```json
{
  "status": "completed",
  "txHash": "0xabc...def",
  "confirmations": 3
}
```

**Response:**
```json
{
  "id": "purchase_123",
  "status": "completed",
  "txHash": "0xabc...def",
  "confirmations": 3,
  "updatedAt": "2024-03-20T10:00:00Z"
}
```

#### 4. List User Purchases
```http
GET /purchases
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `status` (string, optional)

**Response:**
```json
{
  "purchases": [
    {
      "id": "purchase_123",
      "listing": {
        "id": "listing_123",
        "title": "AI Content Generator",
        "price": 99.99
      },
      "status": "completed",
      "amount": 99.99,
      "createdAt": "2024-03-20T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Premium Features

#### 1. Get Premium Features
```http
GET /premium/features
```

**Response:**
```json
{
  "features": [
    {
      "id": "feature_1",
      "name": "Premium Listing",
      "description": "Enhanced visibility for your listings",
      "price": 49.99
    },
    {
      "id": "feature_2",
      "name": "Analytics Access",
      "description": "Advanced analytics and insights",
      "price": 29.99
    }
  ]
}
```

#### 2. Purchase Premium Listing
```http
POST /premium/listing/:listingId
```

**Response:**
```json
{
  "message": "Premium listing purchased successfully"
}
```

#### 3. Purchase Analytics Subscription
```http
POST /premium/analytics/subscribe
```

**Response:**
```json
{
  "message": "Analytics subscription purchased successfully"
}
```

### Access Control

#### 1. Get Asset Metadata
```http
GET /access/metadata/:assetId
```

**Response:**
```json
{
  "metadata": {
    "name": "AI Model Access",
    "description": "Access to premium AI model",
    "attributes": [
      {
        "trait_type": "Access Level",
        "value": "Premium"
      }
    ]
  }
}
```

#### 2. Verify Asset Access
```http
GET /access/verify/:assetId
```

**Response:**
```json
{
  "hasAccess": true
}
```

### Error Responses

All endpoints may return the following error responses:

#### Authentication Errors
```json
{
  "error": {
    "code": "NO_TOKEN",
    "message": "No token provided"
  }
}
```
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
  }
}
```
```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found"
  }
}
```
```json
{
  "error": {
    "code": "PROFILE_FETCH_FAILED",
    "message": "Failed to get profile"
  }
}
```

#### General Errors
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid input parameters",
    "details": {
      "field": "Error message"
    }
  }
}
```
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Rate Limiting

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1616234400
```

## WebSocket Events

### Connection
```javascript
const ws = new WebSocket('wss://api.legionx.com/v1/ws');
```

### Events

#### 1. Listing Updates
```json
{
  "event": "listing.update",
  "data": {
    "id": "listing_123",
    "price": 89.99,
    "updatedAt": "2024-03-20T10:00:00Z"
  }
}
```

#### 2. Purchase Status
```json
{
  "event": "purchase.status",
  "data": {
    "id": "purchase_123",
    "status": "completed",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
}
```

## Testing with Postman

1. Import the following collection into Postman:
```json
{
  "info": {
    "name": "LegionX API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/register",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"wallet\": \"0x1234...5678\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        },
        {
          "name": "Wallet Login",
          "request": {
            "method": "POST",
            "url": "{{baseUrl}}/auth/login/wallet",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"wallet\": \"0x1234...5678\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            }
          }
        }
      ]
    }
  ]
}
```

2. Set up environment variables in Postman:
   - `baseUrl`: https://api.legionx.com/v1
   - `token`: Your authentication token

3. Use the collection to test all endpoints with proper authentication and request/response formats.

## SDK Examples

### JavaScript/TypeScript
```typescript
import { LegionXClient } from '@legionx/sdk';

const client = new LegionXClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.legionx.com/v1'
});

// Register user
const user = await client.auth.register({
  email: 'user@example.com',
  wallet: '0x1234...5678'
});

// Create a listing
const listing = await client.listings.create({
  title: 'AI Content Generator',
  description: 'Advanced AI model for content generation',
  price: 99.99,
  type: 'llm'
});

// Get listings
const listings = await client.listings.list({
  page: 1,
  limit: 10,
  type: 'llm'
});
```

### Python
```python
from legionx import LegionXClient

client = LegionXClient(
    api_key='your_api_key',
    base_url='https://api.legionx.com/v1'
)

# Register user
user = client.auth.register(
    email='user@example.com',
    wallet='0x1234...5678'
)

# Create a listing
listing = client.listings.create(
    title='AI Content Generator',
    description='Advanced AI model for content generation',
    price=99.99,
    type='llm'
)

# Get listings
listings = client.listings.list(
    page=1,
    limit=10,
    type='llm'
)
``` 