# LegionX Backend Flow

## System Architecture

### 1. API Layer
- Express.js server with TypeScript
- RESTful endpoints
- CORS configuration
- JSON body parsing
- Environment variable management

### 2. Database Layer
- PostgreSQL database
- TypeORM for ORM
- Entity-based schema
- Migration support
- Connection pooling

### 3. Project Structure
```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── entities/       # Database entities
│   ├── middleware/     # Custom middleware
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── types/          # TypeScript types
│   └── index.ts        # Entry point
├── package.json
└── tsconfig.json
```

## API Endpoints

### 1. Authentication Routes
```typescript
// routes/auth.routes.ts
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/link-wallet', authController.linkWallet);
```

### 2. Listing Routes
```typescript
// routes/listing.routes.ts
router.get('/', listingController.getListings);
router.get('/:id', listingController.getListing);
router.post('/', listingController.createListing);
router.put('/:id', listingController.updateListing);
router.delete('/:id', listingController.deleteListing);
```

### 3. Purchase Routes
```typescript
// routes/purchase.routes.ts
router.get('/', purchaseController.getPurchases);
router.get('/:id', purchaseController.getPurchase);
router.post('/', purchaseController.createPurchase);
```

## Database Schema

### 1. User Entity
```typescript
// entities/User.ts
@Entity()
export class User {
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

### 2. Listing Entity
```typescript
// entities/Listing.ts
@Entity()
export class Listing {
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

  @Column()
  ipfsHash: string;

  @Column({ nullable: true })
  nftTokenId: string;

  @ManyToOne(() => User, user => user.listings)
  owner: User;

  @OneToMany(() => Purchase, purchase => purchase.listing)
  purchases: Purchase[];
}
```

### 3. Purchase Entity
```typescript
// entities/Purchase.ts
@Entity()
export class Purchase {
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

## Controllers

### 1. Auth Controller
```typescript
// controllers/auth.controller.ts
export class AuthController {
  async register(req: Request, res: Response) {
    const { name, email, password, walletAddress } = req.body;
    // Implementation
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    // Implementation
  }

  async linkWallet(req: Request, res: Response) {
    const { walletAddress, signature } = req.body;
    // Implementation
  }
}
```

### 2. Listing Controller
```typescript
// controllers/listing.controller.ts
export class ListingController {
  async getListings(req: Request, res: Response) {
    const { page, limit, category, search } = req.query;
    // Implementation
  }

  async createListing(req: Request, res: Response) {
    const listingData = req.body;
    // Implementation
  }

  async updateListing(req: Request, res: Response) {
    const { id } = req.params;
    const updateData = req.body;
    // Implementation
  }
}
```

## Services

### 1. Blockchain Service
```typescript
// services/blockchain.service.ts
export class BlockchainService {
  private marketplace: Contract;
  private nft: Contract;
  private token: Contract;

  constructor() {
    this.marketplace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MARKETPLACE_ABI,
      provider
    );
  }

  async createListing(listingData: CreateListingRequest) {
    const tx = await this.marketplace.createListing(
      listingData.title,
      listingData.price,
      listingData.ipfsHash
    );
    return await tx.wait();
  }
}
```

### 2. IPFS Service
```typescript
// services/ipfs.service.ts
export class IPFSService {
  private pinata: PinataClient;

  constructor() {
    this.pinata = new PinataClient({
      pinataApiKey: process.env.PINATA_API_KEY,
      pinataSecretApiKey: process.env.PINATA_SECRET_KEY
    });
  }

  async uploadToIPFS(file: Buffer, metadata: any) {
    const result = await this.pinata.pinFileToIPFS(file, {
      pinataMetadata: {
        name: metadata.name,
        keyvalues: metadata.keyvalues
      }
    });
    return result.IpfsHash;
  }
}
```

## Middleware

### 1. Authentication Middleware
```typescript
// middleware/auth.middleware.ts
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
};
```

### 2. Validation Middleware
```typescript
// middleware/validation.middleware.ts
export const validateListing = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10),
    price: Joi.object({
      subscription: Joi.number().required().min(0),
      full: Joi.number().required().min(0)
    }).required(),
    category: Joi.string().required(),
    specifications: Joi.object().required(),
    ipfsHash: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};
```

## Error Handling

### 1. Global Error Handler
```typescript
// middleware/error.middleware.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
};
```

## Configuration

### 1. Database Configuration
```typescript
// config/database.ts
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Listing, Purchase],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production'
});
```

### 2. Environment Variables
```bash
# .env
PORT=8000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=legionx
JWT_SECRET=your-secret-key
BLOCKCHAIN_RPC_URL=https://mainnet.infura.io/v3/your-project-id
MARKETPLACE_ADDRESS=0x...
NFT_ADDRESS=0x...
TOKEN_ADDRESS=0x...
PINATA_API_KEY=your-pinata-api-key
PINATA_SECRET_KEY=your-pinata-secret-key
```

## Testing

### 1. Unit Tests
```typescript
// __tests__/auth.controller.test.ts
describe('AuthController', () => {
  it('should register a new user', async () => {
    const req = {
      body: {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        walletAddress: '0x123'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await authController.register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
```

## Deployment

### 1. Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]
```

### 2. CI/CD Pipeline
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