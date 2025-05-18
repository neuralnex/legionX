# Backend Flow Documentation

## Overview
The backend is built using TypeScript, Node.js, and follows a modular architecture with clear separation of concerns. It uses TypeORM for database operations and includes blockchain integration through DBSync.

## Directory Structure

### `/src`
Main source code directory containing all application logic.

#### `/config`
Configuration files and database setup.

**database.ts**
- `AppDataSource`: TypeORM data source configuration
- `DBSyncService`: Blockchain data synchronization service
  - `getUtxosForAddress(address)`: Retrieves UTXOs for a given address
  - `getTransactionDetails(txHash)`: Gets transaction details from blockchain
- Types:
  - `UTXO`: Represents unspent transaction outputs
  - `TransactionDetails`: Contains transaction metadata and IPFS information

#### `/controllers`
Request handlers and business logic controllers.

**auth.controller.ts**
- User authentication and authorization
- Endpoints:
  - `POST /auth/register`: Register new user
  - `POST /auth/link-wallet`: Link wallet to user
  - `POST /auth/login/wallet`: Login with wallet
  - `GET /auth/verify`: Verify JWT token
  - `GET /auth/profile`: Get user profile (protected)

**listing.controller.ts**
- NFT listing operations
- Endpoints:
  - `POST /listings`: Create new listing
  - `GET /listings`: Get all listings
  - `GET /listings/:id`: Get specific listing
  - `PUT /listings/:id`: Update listing
  - `DELETE /listings/:id`: Delete listing

**purchase.controller.ts**
- NFT purchase transactions
- Endpoints:
  - `POST /purchases`: Create new purchase
  - `GET /purchases`: Get user's purchases
  - `GET /purchases/:id`: Get specific purchase
  - `POST /purchases/:id/confirm`: Confirm purchase

**premium.controller.ts**
- Premium features and analytics
- Endpoints:
  - `GET /premium/features`: Get premium features
  - `GET /premium/analytics/features`: Get analytics features
  - `POST /premium/listing/:listingId`: Purchase premium listing
  - `POST /premium/analytics/subscribe`: Subscribe to analytics

#### `/entities`
TypeORM entity definitions for database models.

**User.ts**
- User entity with fields:
  - `id`: Primary key
  - `username`: User's username
  - `email`: User's email
  - `password`: Hashed password
  - `wallet`: Optional wallet address
  - `hasAnalyticsAccess`: Analytics subscription status
  - `analyticsExpiry`: Analytics subscription expiry date
  - Relationships with listings, purchases, and agents

**Listing.ts**
- NFT listing entity with fields:
  - `id`: Primary key
  - `title`: Listing title
  - `description`: Listing description
  - `price`: Listing price
  - `assetId`: NFT asset ID
  - `ownerAddress`: Owner's wallet address
  - `isPremium`: Premium listing status
  - `premiumExpiry`: Premium status expiry date
  - `isActive`: Listing status
  - Relationships with seller and purchases

#### `/middleware`
Custom middleware functions.

**auth.middleware.ts**
- JWT token verification
- User authentication
- Role-based access control

#### `/routes`
API route definitions.

**auth.routes.ts**
- Authentication routes:
  - Public routes for registration and login
  - Protected routes for profile access

**listing.routes.ts**
- Listing management routes
- CRUD operations for NFT listings

**purchase.routes.ts**
- Purchase transaction routes
- Purchase creation and confirmation

**premium.routes.ts**
- Premium features routes
- Analytics subscription routes

#### `/services`
Core business logic and external service integrations.

**auth.service.ts**
- User authentication logic
- JWT token management
- Wallet linking functionality

**fee.service.ts**
- Transaction fee calculation (3%)
- Premium listing processing
- Analytics subscription management

**nft.service.ts**
- NFT metadata management
- IPFS integration
- Blockchain data synchronization

**pinata.ts**
- IPFS file storage
- Metadata management
- File pinning/unpinning

#### `/types`
TypeScript type definitions.

**auth.ts**
- Authentication types:
  - `UserPayload`: JWT payload structure
  - `RegisterRequest`: Registration request data
  - `LinkWalletRequest`: Wallet linking request data
  - `AuthError`: Authentication error structure

#### `/utils`
Utility functions.

**logger.ts**
- Logging utility with levels:
  - `info`: Information logging
  - `error`: Error logging
  - `warn`: Warning logging
  - `debug`: Debug logging (development only)

## Business Logic

### Transaction Fees
- 3% fee on all sales and resales
- Fee calculation in `FeeService`
- Automatic fee deduction from transactions

### Premium Features
- Enhanced listing visibility
- Priority in search results
- Custom listing badges
- Advanced analytics access
- 30-day premium status

### Analytics
- Market trend analysis
- Price history tracking
- Competitor analysis
- Sales performance metrics
- Custom reports generation
- Monthly subscription model

## Security Features
- JWT-based authentication
- Role-based access control
- Input validation
- Error handling
- Secure password hashing
- Wallet address verification

## Dependencies
- TypeScript
- Node.js
- Express.js
- TypeORM
- PostgreSQL
- JWT
- IPFS/Pinata
- DBSync

## Environment Variables
Required environment variables:
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT
- `PINATA_JWT`: Pinata JWT token
- `PINATA_GATEWAY`: Pinata gateway URL
- `NODE_ENV`: Environment (development/production)

## AI Agent NFT System

### Agent Metadata Structure
```typescript
interface AIModelMetadata {
  name: string;
  description: string;
  version: string;
  modelType: string;
  capabilities: string[];
  parameters: {
    [key: string]: any;
  };
  apiEndpoint: string;
  accessToken?: string;
  pricing: {
    subscription: {
      monthly: number;
      yearly: number;
    };
    oneTime: number;
  };
  requirements: {
    minMemory: number;
    minStorage: number;
    dependencies: string[];
  };
}
```

### IPFS Integration (Pinata)
The system uses Pinata for IPFS storage of agent metadata:

```typescript
class PinataService {
  private pinata: PinataClient;
  
  async uploadMetadata(metadata: AIModelMetadata): Promise<string> {
    // Upload metadata to IPFS via Pinata
    // Returns IPFS hash (CID)
  }

  async getMetadata(ipfsHash: string): Promise<AIModelMetadata> {
    // Fetch metadata from IPFS via Pinata
  }
}
```

### NFT Minting Flow
1. **Metadata Upload**
   - Agent metadata is uploaded to IPFS via Pinata
   - Returns IPFS hash (CID) for the metadata

2. **NFT Creation**
   - Mint NFT with metadata URI pointing to IPFS
   - NFT represents ownership of the AI agent
   - Includes royalty information for the creator

3. **Listing Creation**
   - Create marketplace listing for the NFT
   - Set pricing (subscription/one-time)
   - Configure access controls

## Smart Contract Integration

### Lucid Service
The `LucidService` class handles all blockchain interactions:

```typescript
class LucidService {
  private lucid: LucidEvolution;
  private marketValidatorAddress: string;
  private oracleValidatorAddress: string;
}
```

#### Key Features:
- Blockfrost provider integration for Cardano network
- Automatic retry mechanism for failed operations
- Transaction building and signing
- UTxO management
- Price oracle integration

### Transaction Types

1. **Listing Transactions**
   - Create listing with metadata
   - Edit listing details
   - Cancel listing
   - Query listing UTxOs

2. **Purchase Transactions**
   - Full purchase
   - Subscription purchase
   - Price conversion (USD to ADA)
   - Automatic fee calculation

3. **Token Transactions**
   - Oneshot token minting
   - Token transfer
   - Asset management

### Transaction Monitoring
The `TransactionMonitorService` provides real-time monitoring of blockchain transactions:

```typescript
class TransactionMonitorService {
  private lucid: LucidEvolution;
  private checkInterval: number = 30000; // 30 seconds
  private maxConfirmations: number = 20; // ~10 minutes on Cardano
}
```

#### Key Features:
- Automatic monitoring of pending transactions
- Transaction confirmation tracking
- Status updates for purchases and listings
- Event emission for webhook notifications
- Configurable confirmation thresholds
- Error handling and retry logic

## Complete Agent Marketplace Flow

### 1. Agent Creation and Listing
```typescript
async createAgentListing(
  agentMetadata: AIModelMetadata,
  pricing: {
    subscription?: {
      monthly: number;
      yearly: number;
    };
    oneTime?: number;
  }
): Promise<string> {
  // 1. Upload metadata to IPFS
  const ipfsHash = await this.pinataService.uploadMetadata(agentMetadata);
  
  // 2. Mint NFT with metadata URI
  const nftTxHash = await this.lucidService.mintAgentNFT(ipfsHash);
  
  // 3. Create marketplace listing
  const listingTxHash = await this.lucidService.createListing(
    nftTxHash,
    pricing
  );
  
  return listingTxHash;
}
```

### 2. Purchase Flow
```typescript
async purchaseAgent(
  listingId: string,
  purchaseType: 'subscription' | 'oneTime',
  duration?: number
): Promise<string> {
  // 1. Build purchase transaction
  const txHash = await this.lucidService.buildPurchaseTransaction(
    listingId,
    purchaseType,
    duration
  );
  
  // 2. Monitor transaction
  await this.transactionMonitor.startMonitoring(txHash);
  
  // 3. On confirmation, grant access
  await this.accessControlService.grantAccess(
    listingId,
    purchaseType,
    duration
  );
  
  return txHash;
}
```

### 3. Access Control
```typescript
class AccessControlService {
  async grantAccess(
    listingId: string,
    purchaseType: string,
    duration?: number
  ): Promise<void> {
    // 1. Get agent metadata from IPFS
    const metadata = await this.pinataService.getMetadata(
      listing.metadataUri
    );
    
    // 2. Generate access token
    const accessToken = await this.generateAccessToken(metadata);
    
    // 3. Store access credentials
    await this.storeAccessCredentials(
      listingId,
      accessToken,
      duration
    );
  }
}
```

## Database Integration

### Entities

1. **Purchase**
   - Buyer information
   - Listing reference
   - Transaction hash
   - Purchase status
   - Amount
   - Confirmation count

2. **Listing**
   - Seller information
   - Model metadata
   - Price information
   - Status
   - Transaction hash
   - Confirmation count

## Error Handling

### Retry Mechanism
```typescript
private async retry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < this.maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < this.maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
      }
    }
  }
  throw lastError;
}
```

## API Endpoints

### Agent Controller

1. **Create Agent**
```typescript
   POST /agents
   Body: {
     metadata: AIModelMetadata,
     pricing: {
       subscription?: {
         monthly: number;
         yearly: number;
       };
       oneTime?: number;
     }
   }
   ```

2. **List Agents**
```typescript
   GET /agents
   Query: {
     type?: string;
     minPrice?: number;
     maxPrice?: number;
     capabilities?: string[];
   }
   ```

3. **Get Agent**
```typescript
   GET /agents/:id
   ```

### Purchase Controller

1. **Create Purchase**
```typescript
   POST /purchases
   Body: {
     listingId: string,
     purchaseType: 'subscription' | 'oneTime',
     duration?: number
   }
   ```

2. **Get Purchases**
   ```typescript
   GET /purchases
   ```

3. **Get Purchase**
```typescript
   GET /purchases/:id
   ```

## Future Improvements

1. **Transaction Monitoring**
   - Add webhook system for transaction confirmations
   - Implement automatic status updates
   - Add transaction confirmation monitoring
   - Add support for custom confirmation thresholds
   - Implement transaction rollback on failure

2. **Performance Optimization**
   - Implement batch operations
   - Add caching layer
   - Optimize UTxO queries
   - Add parallel transaction processing

3. **Enhanced Error Handling**
   - Add comprehensive error logging
   - Implement rate limiting
   - Add transaction rollback support
   - Add detailed error reporting

4. **Additional Features**
   - Support for batch operations
   - Enhanced analytics
   - Advanced search capabilities
   - Real-time transaction notifications
   - Agent versioning system
   - Usage analytics
   - Revenue sharing
   - Multi-chain support 