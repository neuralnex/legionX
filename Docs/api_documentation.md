# LegionX API Documentation

## Overview

The LegionX API provides endpoints for managing AI model listings, purchases, and user authentication. The API is built with Express.js and uses TypeORM for database operations.

## Base URL

```
https://localhost:3000
```

## Authentication

Most endpoints require authentication using a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Environment Variables

The following environment variables are required for the API to function:

### Database Configuration
Either use a single `DATABASE_URL`:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

Or individual database parameters:
```
DB_HOST=your_db_host
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

### JWT Configuration
```
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

### Optional Configuration
```
BLOCKFROST_API_KEY=your_blockfrost_api_key
PINATA_API_KEY=your_pinata_api_key
PINATA_API_SECRET=your_pinata_api_secret
PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "wallet": "addr_test..."
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "your.jwt.token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "wallet": "addr_test..."
  }
}
```

#### Login with Wallet
```http
POST /api/v1/auth/login/wallet
Content-Type: application/json

{
  "wallet": "addr_test...",
  "signature": "signed_message"
}
```

Response:
```json
{
  "message": "Login successful",
  "token": "your.jwt.token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "wallet": "addr_test..."
  }
}
```

#### Link Wallet
```http
POST /api/v1/auth/link-wallet
Content-Type: application/json

{
  "email": "user@example.com",
  "wallet": "addr_test..."
}
```

Response:
```json
{
  "message": "Wallet linked successfully",
  "token": "your.jwt.token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "wallet": "addr_test..."
  }
}
```

#### Verify Token
```http
GET /api/v1/auth/verify
Authorization: Bearer <your_jwt_token>
```

Response:
```json
{
  "message": "Token is valid",
  "user": {
    "sub": "user_id",
    "email": "user@example.com",
    "wallet": "addr_test..."
  }
}
```

#### Get Profile
```http
GET /api/v1/auth/profile
Authorization: Bearer <your_jwt_token>
```

Response:
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "wallet": "addr_test...",
    "username": "user",
    "createdAt": "2024-03-14T12:00:00Z",
    "updatedAt": "2024-03-14T12:00:00Z"
  }
}
```

### Listings

#### Get All Listings
```http
GET /api/v1/listings
```

#### Get Listing by ID
```http
GET /api/v1/listings/:id
```

#### Create Listing
```http
POST /api/v1/listings
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "AI Model Name",
  "description": "Model description",
  "price": 100,
  "modelMetadata": {
    "type": "text",
    "parameters": "7B",
    "framework": "PyTorch"
  }
}
```

#### Update Listing
```http
PUT /api/v1/listings/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Model Name",
  "price": 150
}
```

#### Delete Listing
```http
DELETE /api/v1/listings/:id
Authorization: Bearer <token>
```

### Purchases

#### Get User Purchases
```http
GET /api/v1/purchases
Authorization: Bearer <token>
```

#### Get Purchase by ID
```http
GET /api/v1/purchases/:id
Authorization: Bearer <token>
```

#### Create Purchase
```http
POST /api/v1/purchases
Authorization: Bearer <token>
Content-Type: application/json

{
  "listingId": "listing_id",
  "amount": 100
}
```

### Premium Features

#### Get Premium Features
```http
GET /api/v1/premium/features
```

#### Get Analytics Features
```http
GET /api/v1/premium/analytics/features
```

#### Purchase Premium Listing
```http
POST /api/v1/premium/listing/:listingId
Authorization: Bearer <token>
```

#### Purchase Analytics Subscription
```http
POST /api/v1/premium/analytics/subscribe
Authorization: Bearer <token>
```

### IPFS

#### Upload File
```http
POST /ipfs/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

#### Get Metadata
```http
GET /ipfs/metadata/:cid
```

## Error Responses

The API uses standard HTTP status codes and returns error messages in the following format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

Common error codes:
- `INVALID_CREDENTIALS`: Authentication failed
- `UNAUTHORIZED`: Missing or invalid token
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `DATABASE_ERROR`: Database operation failed

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## SSL/TLS

All API endpoints are served over HTTPS. The API requires SSL for database connections in production.

## Support

For API support or to report issues, please contact:
- Email: support@legionx.io
- Discord: [LegionX Discord Server] 