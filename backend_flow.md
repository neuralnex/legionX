# Backend Flow Documentation

## Overview
The backend is built using TypeScript and integrates with the Cardano blockchain using Lucid Evolution. It provides a robust API for managing AI model listings, purchases, and subscriptions.

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

## Environment Configuration

Required environment variables:
```env
BLOCKFROST_API_KEY=your_blockfrost_api_key
MARKET_VALIDATOR_ADDRESS=your_market_validator_address
ORACLE_VALIDATOR_ADDRESS=your_oracle_validator_address
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
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

## Security Features

1. **Authentication**
   - JWT-based authentication
   - User wallet validation
   - Role-based access control

2. **Transaction Security**
   - Transaction signing
   - UTxO validation
   - Price verification
   - Confirmation monitoring

3. **Access Control**
   - Token-based API access
   - Rate limiting
   - Usage tracking
   - Subscription management

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