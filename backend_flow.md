# LegionX Backend Flow

## System Architecture

### 1. API Layer
- Express.js server
- RESTful endpoints
- WebSocket support
- Rate limiting
- CORS configuration

### 2. Database Layer
- PostgreSQL database
- TypeORM for ORM
- Migrations
- Indexing strategy
- Backup system

### 3. Blockchain Integration
- Web3.js/Ethers.js
- Contract interaction
- Event listening
- Transaction management
- Gas optimization

## API Endpoints

### 1. Authentication
```typescript
// POST /api/auth/register
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  walletAddress: string;
}

// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

// POST /api/auth/link-wallet
interface LinkWalletRequest {
  walletAddress: string;
  signature: string;
}
```

### 2. Listings
```typescript
// GET /api/listings
interface ListingsResponse {
  data: Listing[];
  total: number;
  page: number;
  limit: number;
}

// POST /api/listings
interface CreateListingRequest {
  title: string;
  description: string;
  price: {
    subscription: number;
    full: number;
  };
  category: string;
  specifications: Record<string, any>;
  images: File[];
}

// PUT /api/listings/:id
interface UpdateListingRequest {
  title?: string;
  description?: string;
  price?: {
    subscription?: number;
    full?: number;
  };
  category?: string;
  specifications?: Record<string, any>;
  images?: File[];
}
```

### 3. Purchases
```typescript
// POST /api/listings/purchase
interface PurchaseRequest {
  listingId: string;
  type: 'subscription' | 'full';
  walletAddress: string;
}

// GET /api/purchases
interface PurchasesResponse {
  data: Purchase[];
  total: number;
  page: number;
  limit: number;
}
```

## Database Schema

### 1. Users
```typescript
@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ nullable: true })
  walletAddress: string;

  @OneToMany(() => Listing, listing => listing.owner)
  listings: Listing[];

  @OneToMany(() => Purchase, purchase => purchase.buyer)
  purchases: Purchase[];
}
```

### 2. Listings
```typescript
@Entity()
class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column('jsonb')
  price: {
    subscription: number;
    full: number;
  };

  @Column()
  category: string;

  @Column('jsonb')
  specifications: Record<string, any>;

  @Column('simple-array')
  images: string[];

  @Column({ nullable: true })
  nftTokenId: string;

  @ManyToOne(() => User, user => user.listings)
  owner: User;

  @OneToMany(() => Purchase, purchase => purchase.listing)
  purchases: Purchase[];
}
```

### 3. Purchases
```typescript
@Entity()
class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  type: 'subscription' | 'full';

  @Column()
  status: 'pending' | 'completed' | 'failed';

  @Column({ nullable: true })
  transactionHash: string;

  @ManyToOne(() => User, user => user.purchases)
  buyer: User;

  @ManyToOne(() => Listing, listing => listing.purchases)
  listing: Listing;
}
```

## Blockchain Integration

### 1. Contract Interaction
```typescript
class BlockchainService {
  private marketplace: Contract;
  private nft: Contract;
  private token: Contract;

  constructor() {
    this.marketplace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );
    // Initialize other contracts
  }

  async createListing(listingData: CreateListingRequest) {
    const tx = await this.marketplace.createListing(
      listingData.title,
      listingData.price,
      listingData.uri
    );
    return await tx.wait();
  }

  async purchaseListing(purchaseData: PurchaseRequest) {
    const tx = await this.marketplace.purchase(
      purchaseData.listingId,
      purchaseData.type
    );
    return await tx.wait();
  }
}
```

### 2. Event Listening
```typescript
class EventListener {
  constructor(private blockchainService: BlockchainService) {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.blockchainService.marketplace.on('ListingCreated', async (event) => {
      await this.handleListingCreated(event);
    });

    this.blockchainService.marketplace.on('PurchaseCompleted', async (event) => {
      await this.handlePurchaseCompleted(event);
    });
  }
}
```

## Security Implementation

### 1. Authentication
```typescript
class AuthMiddleware {
  static async verify(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
}
```

### 2. Input Validation
```typescript
class ValidationMiddleware {
  static validateListing(req: Request, res: Response, next: NextFunction) {
    const schema = Joi.object({
      title: Joi.string().required().min(3).max(100),
      description: Joi.string().required().min(10),
      price: Joi.object({
        subscription: Joi.number().required().min(0),
        full: Joi.number().required().min(0)
      }).required(),
      category: Joi.string().required(),
      specifications: Joi.object().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  }
}
```

## Error Handling

### 1. Global Error Handler
```typescript
class ErrorHandler {
  static handle(err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err);

    if (err instanceof ValidationError) {
      return res.status(400).json({
        message: 'Validation error',
        errors: err.errors
      });
    }

    if (err instanceof BlockchainError) {
      return res.status(500).json({
        message: 'Blockchain transaction failed',
        error: err.message
      });
    }

    return res.status(500).json({
      message: 'Internal server error'
    });
  }
}
```

## Testing Strategy

### 1. Unit Tests
- API endpoints
- Service methods
- Validation logic
- Error handling

### 2. Integration Tests
- Database operations
- Blockchain interactions
- File uploads
- Authentication flow

### 3. End-to-End Tests
- Complete user flows
- Error scenarios
- Performance testing
- Load testing

## Deployment

### 1. Environment Setup
```bash
# .env
DATABASE_URL=postgresql://user:password@localhost:5432/legionx
JWT_SECRET=your-secret-key
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/your-project-id
MARKETPLACE_ADDRESS=0x...
NFT_ADDRESS=0x...
TOKEN_ADDRESS=0x...
```

### 2. Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 3. CI/CD Pipeline
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        run: |
          docker build -t legionx-backend .
          docker push legionx-backend
``` 