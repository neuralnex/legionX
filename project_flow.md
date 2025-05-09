# LegionX Project Flow

## System Architecture Overview

```mermaid
graph TD
    A[Frontend] -->|HTTP/HTTPS| B[Backend API]
    B -->|Database Queries| C[PostgreSQL]
    B -->|Blockchain Queries| D[Cardano DBSync]
    B -->|Smart Contract Interaction| E[Cardano Blockchain]
    B -->|Metadata Storage| F[IPFS/Pinata]
```

## Component Interaction Flow

### 1. Authentication Flow
```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Login Request
    Frontend->>Backend: POST /api/auth/login
    Backend->>Database: Verify Credentials
    Database-->>Backend: User Data
    Backend-->>Frontend: JWT Token
    Frontend-->>User: Authenticated Session
```

### 2. AI Agent Listing Flow
```mermaid
sequenceDiagram
    participant Creator
    participant Frontend
    participant Backend
    participant IPFS
    participant Blockchain
    
    Creator->>Frontend: Create Listing
    Frontend->>Backend: POST /api/listings
    Backend->>IPFS: Upload Metadata
    IPFS-->>Backend: IPFS Hash
    Backend->>Blockchain: Create Listing
    Blockchain-->>Backend: Transaction Hash
    Backend-->>Frontend: Listing Created
    Frontend-->>Creator: Success Confirmation
```

### 3. Purchase Flow
```mermaid
sequenceDiagram
    participant Buyer
    participant Frontend
    participant Backend
    participant Blockchain
    participant IPFS
    
    Buyer->>Frontend: Initiate Purchase
    Frontend->>Backend: POST /api/purchases
    Backend->>Blockchain: Create Transaction
    Blockchain-->>Backend: Transaction Confirmed
    Backend->>IPFS: Store Purchase Metadata
    Backend-->>Frontend: Purchase Complete
    Frontend-->>Buyer: Access Granted
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get specific listing
- `POST /api/listings` - Create new listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Purchases
- `POST /api/purchases` - Create purchase
- `GET /api/purchases` - Get user's purchases
- `GET /api/purchases/:id` - Get specific purchase

### Access Control
- `GET /api/access/metadata/:assetId` - Get NFT metadata
- `GET /api/access/verify/:assetId` - Verify access rights

## Data Flow

1. **Frontend to Backend**
   - RESTful API calls
   - JWT authentication
   - JSON data format
   - WebSocket for real-time updates

2. **Backend to Blockchain**
   - Lucid service for transaction building
   - DBSync for blockchain data querying
   - Smart contract interaction

3. **Backend to IPFS**
   - Metadata storage
   - Content addressing
   - Pinata integration

## Security Measures

1. **Authentication**
   - JWT token-based authentication
   - Secure password hashing
   - Rate limiting

2. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection

3. **Blockchain Security**
   - Transaction signing
   - Smart contract validation
   - Wallet verification

## Error Handling

1. **Frontend**
   - User-friendly error messages
   - Retry mechanisms
   - Fallback UI states

2. **Backend**
   - Structured error responses
   - Logging and monitoring
   - Transaction rollback

## Performance Considerations

1. **Caching**
   - Redis for session data
   - Browser caching
   - API response caching

2. **Optimization**
   - Database indexing
   - Query optimization
   - Asset compression

## Monitoring and Logging

1. **Backend Monitoring**
   - API performance metrics
   - Error tracking
   - User activity logs

2. **Blockchain Monitoring**
   - Transaction status
   - Smart contract events
   - Network health 