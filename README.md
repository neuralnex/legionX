# AI Agent Marketplace

A decentralized marketplace for AI agents and models, built on the Cardano blockchain. This platform enables creators to monetize their AI models and users to access powerful AI capabilities through NFT-based ownership.

## Features

- 🎯 AI Agent Listing and Management
- 💰 NFT-based Ownership
- 🔒 Secure Access Control
- 💳 Flexible Pricing Models
- 📊 Usage Analytics
- 🔄 Real-time Updates
- 🌐 IPFS Metadata Storage
- 💎 Cardano Blockchain Integration

## Tech Stack

### Frontend
- React with TypeScript
- HeroUI Component Library
- TailwindCSS
- Framer Motion
- React Query

### Backend
- Node.js with TypeScript
- Express.js
- TypeORM
- Lucid Evolution
- JWT Authentication
- WebSocket

### Blockchain
- Cardano
- Aiken Smart Contracts
- Lucid Evolution SDK
- Blockfrost API

### Storage
- PostgreSQL
- DBSync
- IPFS/Pinata

## Getting Started

### Prerequisites
- Node.js 
- PostgreSQL
- DBSync
- BlockFrost
- Aiken Smart Contract
- Pinata Account

### Installation

1. Clone the repository
```bash
git clone [https://github.com/neuralnex/legionX.git]
cd legionX
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Configure environment variables
```bash
# Backend (.env)
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/marketplace
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
BLOCKFROST_API_KEY=your_blockfrost_api_key

# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
```

4. Start the development servers
```bash
# Start backend
cd backend
pnpm run dev

# Start frontend
cd ../frontend
npm run dev
```



## Development

### Code Style
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety

### Testing
```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

### Building for Production
```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

## Deployment

### Backend Deployment
1. Set up a Node.js server
2. Configure environment variables
3. Build the application
4. Start the server with PM2

### Frontend Deployment
1. Build the application
2. Deploy to a CDN
3. Configure environment variables
4. Set up SSL certificates

### Database Setup
1. Create PostgreSQL database
2. Run migrations
3. Set up backups
4. Configure replication

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request



## Support

For support, please:


## Acknowledgments

- [HeroUI](https://www.heroui.com) for the UI components
- [Lucid Evolution](https://github.com/lucid-evolution/lucid) for Cardano integration
- [Pinata](https://pinata.cloud) for IPFS storage
- [Blockfrost](https://blockfrost.io) for Cardano API
- [Cardano](https://developers.cardano.org/tools) for Cardano builder tools
